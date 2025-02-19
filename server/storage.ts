import { IStorage } from "./types";
import { User, Transaction, FraudAlert } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
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
      (user) => user.role === "customer",
    );
  }
}

export const storage = new MemStorage();
