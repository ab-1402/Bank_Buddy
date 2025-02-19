import { IStorage } from "./types";
import { users, accounts, transactions, fraudAlerts } from "@shared/schema";
import type { User, Transaction, FraudAlert, Account } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Initialize demo data if not exists
    this.initializeDemoData();
  }

  private async initializeDemoData() {
    // Check if we have any accounts
    const existingAccounts = await db.select().from(accounts);

    if (existingAccounts.length === 0) {
      // Insert demo accounts
      await db.insert(accounts).values([
        {
          accountNumber: "1234567890",
          accountHolderName: "Rohan Sharma",
          upiId: "rohan@upi",
          balance: "50000.00",
        },
        {
          accountNumber: "9876543210",
          accountHolderName: "Priya Patel",
          upiId: "priya@upi",
          balance: "75000.00",
        },
        {
          accountNumber: "5678901234",
          accountHolderName: "Amit Kumar",
          upiId: "amit@upi",
          balance: "100000.00",
        }
      ]);
    }

    // Check if we have any users
    const existingUsers = await db.select().from(users);

    if (existingUsers.length === 0) {
      // Insert demo user
      const [user] = await db.insert(users).values({
        username: "abhay0123",
        password: "1234",
        role: "customer",
        fullName: "Abhay Borase",
        balance: "10000.00",
      }).returning();

      // Insert demo transactions
      await db.insert(transactions).values([
        {
          userId: user.id,
          amount: "415000.00",
          type: "deposit",
          description: "Salary Deposit",
          timestamp: new Date("2024-01-15"),
        },
        {
          userId: user.id,
          amount: "124500.00",
          type: "withdrawal",
          description: "Rent Payment",
          timestamp: new Date("2024-01-20"),
        },
        {
          userId: user.id,
          amount: "166000.00",
          type: "deposit",
          description: "Investment Returns",
          timestamp: new Date("2024-02-01"),
        }
      ]);

      // Insert demo fraud alerts
      await db.insert(fraudAlerts).values([
        {
          userId: user.id,
          description: "Unusual login attempt detected from new location",
          severity: "medium",
          timestamp: new Date("2024-02-15"),
          resolved: false,
        },
        {
          userId: user.id,
          description: "Multiple failed transactions in quick succession",
          severity: "high",
          timestamp: new Date("2024-02-18"),
          resolved: false,
        }
      ]);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: Omit<User, "id">): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getTransactions(userId: number): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.userId, userId));
  }

  async getFraudAlerts(userId: number): Promise<FraudAlert[]> {
    return db.select().from(fraudAlerts).where(eq(fraudAlerts.userId, userId));
  }

  async getCustomers(): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, "customer"));
  }

  async getAccountByUpiId(upiId: string): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.upiId, upiId));
    return account;
  }
}

export const storage = new DatabaseStorage();