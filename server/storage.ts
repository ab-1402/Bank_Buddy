import { IStorage } from "./types";
import { users, accounts, transactions, fraudAlerts } from "@shared/schema";
import type { User, Transaction, FraudAlert, Account } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";
import { sql } from "drizzle-orm";

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
  }

  private generateAccountNumber(): string {
    return Math.floor(Math.random() * 9000000000 + 1000000000).toString();
  }

  private createUpiId(fullName: string): string {
    // Get first name and remove any special characters
    const firstName = fullName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${firstName}@upi`;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: Omit<User, "id">): Promise<User> {
    return await db.transaction(async (tx) => {
      // Create user
      const [user] = await tx.insert(users).values({
        ...userData,
        balance: "10000.00", // Set initial balance
      }).returning();

      // Create associated account
      await tx.insert(accounts).values({
        accountNumber: this.generateAccountNumber(),
        accountHolderName: userData.fullName,
        upiId: this.createUpiId(userData.fullName),
        balance: "10000.00", // Set initial balance
      });

      return user;
    });
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

  async transferMoney(userId: number, amount: number, toUpiId: string): Promise<boolean> {
    // Start a transaction to ensure atomicity
    return await db.transaction(async (tx) => {
      // Get sender's user record
      const [sender] = await tx
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!sender) {
        throw new Error("Sender not found");
      }

      // Get receiver's account
      const [receiver] = await tx
        .select()
        .from(accounts)
        .where(eq(accounts.upiId, toUpiId));

      if (!receiver) {
        throw new Error("Receiver UPI ID not found");
      }

      // Check if sender has sufficient balance
      if (parseFloat(sender.balance) < amount) {
        throw new Error("Insufficient balance");
      }

      // Update sender's balance
      await tx
        .update(users)
        .set({
          balance: sql`${users.balance} - ${amount}`,
        })
        .where(eq(users.id, userId));

      // Update receiver's balance
      await tx
        .update(accounts)
        .set({
          balance: sql`${accounts.balance} + ${amount}`,
        })
        .where(eq(accounts.upiId, toUpiId));

      // Record the transaction
      await tx.insert(transactions).values({
        userId,
        amount: amount.toString(),
        type: "transfer",
        description: `Transfer to ${receiver.accountHolderName} (${toUpiId})`,
      });

      return true;
    });
  }
}

export const storage = new DatabaseStorage();