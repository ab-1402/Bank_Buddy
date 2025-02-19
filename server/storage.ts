import { IStorage } from "./types";
import { User, Transaction, FraudAlert, Account } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Sample account data
const sampleAccounts: Account[] = [
  {
    id: 1,
    accountNumber: "1234567890",
    accountHolderName: "Rohan Sharma",
    upiId: "rohan@upi",
    balance: "50000.00",
  },
  {
    id: 2,
    accountNumber: "9876543210",
    accountHolderName: "Priya Patel",
    upiId: "priya@upi",
    balance: "75000.00",
  },
  {
    id: 3,
    accountNumber: "5678901234",
    accountHolderName: "Amit Kumar",
    upiId: "amit@upi",
    balance: "100000.00",
  }
];

// Sample transaction data for demo
const sampleTransactions: Transaction[] = [
  {
    id: 1,
    userId: 1,
    amount: "415000.00",
    type: "deposit",
    description: "Salary Deposit",
    timestamp: new Date("2024-01-15").toISOString(),
  },
  {
    id: 2,
    userId: 1,
    amount: "124500.00",
    type: "withdrawal",
    description: "Rent Payment",
    timestamp: new Date("2024-01-20").toISOString(),
  },
  {
    id: 3,
    userId: 1,
    amount: "166000.00",
    type: "deposit",
    description: "Investment Returns",
    timestamp: new Date("2024-02-01").toISOString(),
  }
];

// Sample fraud alerts
const sampleFraudAlerts: FraudAlert[] = [
  {
    id: 1,
    userId: 1,
    description: "Unusual login attempt detected from new location",
    severity: "medium",
    timestamp: new Date("2024-02-15").toISOString(),
    resolved: false,
  },
  {
    id: 2,
    userId: 1,
    description: "Multiple failed transactions in quick succession",
    severity: "high",
    timestamp: new Date("2024-02-18").toISOString(),
    resolved: false,
  }
];

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction[]>;
  private fraudAlerts: Map<number, FraudAlert[]>;
  private accounts: Map<number, Account>;
  sessionStore: session.Store;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.fraudAlerts = new Map();
    this.accounts = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Initialize sample data
    sampleAccounts.forEach(account => {
      this.accounts.set(account.id, account);
    });

    // Initialize with sample data
    const sampleUser: User = {
      id: 1,
      username: "abhay0123",
      password: "1234",
      role: "customer",
      fullName: "Abhay Borase",
      balance: "10000.00",
    };

    this.users.set(1, sampleUser);
    this.transactions.set(1, sampleTransactions);
    this.fraudAlerts.set(1, sampleFraudAlerts);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: Omit<User, "id">): Promise<User> {
    const id = this.currentId++;
    const newUser = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async getTransactions(userId: number): Promise<Transaction[]> {
    return this.transactions.get(userId) || [];
  }

  async getFraudAlerts(userId: number): Promise<FraudAlert[]> {
    return this.fraudAlerts.get(userId) || [];
  }

  async getCustomers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.role === "customer"
    );
  }

  async getAccountByUpiId(upiId: string): Promise<Account | undefined> {
    return Array.from(this.accounts.values()).find(
      (account) => account.upiId === upiId
    );
  }
}

export const storage = new MemStorage();