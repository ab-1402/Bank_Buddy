import { IStorage } from "./types";
import { User, Transaction, FraudAlert } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Sample transaction data for abhay0123
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
  },
  {
    id: 4,
    userId: 1,
    amount: "66400.00",
    type: "withdrawal",
    description: "Utility Bills",
    timestamp: new Date("2024-02-10").toISOString(),
  },
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
  },
];

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction[]>;
  private fraudAlerts: Map<number, FraudAlert[]>;
  sessionStore: session.Store;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.fraudAlerts = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Initialize with sample data
    const sampleUser: User = {
      id: 1,
      username: "abhay0123",
      password: "hashed_password_here",
      role: "customer",
      fullName: "Abhay Kumar",
      balance: "722100.00",
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
}

export const storage = new MemStorage();