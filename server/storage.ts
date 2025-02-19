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
    amount: "3000.00",
    type: "deposit",
    description: "Salary Advance",
    timestamp: new Date("2024-02-15").toISOString(),
  },
  {
    id: 2,
    userId: 1,
    amount: "2000.00",
    type: "deposit",
    description: "Savings Transfer",
    timestamp: new Date("2024-02-18").toISOString(),
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
      // This is a hashed version of "1234"
      password: "b250535432b380a8c7c5cc5c5e0d2d46ce0ba224d05ef4975bb4210810f41ac0e64e43f4c4ebf2f9fd81d380a6a0f2d4c6ade9bf7e32559d0ef2fe5e3f53f300.8e8d1a3c62e3c8a0",
      role: "customer",
      fullName: "Abhay Borase",
      balance: "5000.00",
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