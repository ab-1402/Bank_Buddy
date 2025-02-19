import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Get user's transactions
  app.get("/api/transactions/:userId", async (req, res) => {
    const transactions = await storage.getTransactions(parseInt(req.params.userId));
    res.json(transactions);
  });

  // Get user's fraud alerts
  app.get("/api/fraud-alerts/:userId", async (req, res) => {
    const alerts = await storage.getFraudAlerts(parseInt(req.params.userId));
    res.json(alerts);
  });

  // Get account by UPI ID
  app.get("/api/accounts/upi/:upiId", async (req, res) => {
    const account = await storage.getAccountByUpiId(req.params.upiId);
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }
    res.json(account);
  });

  // Transfer money
  app.post("/api/transfer", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const transferSchema = z.object({
      amount: z.number().positive(),
      toUpiId: z.string().min(1),
    });

    try {
      const { amount, toUpiId } = transferSchema.parse(req.body);
      await storage.transferMoney(req.user.id, amount, toUpiId);
      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input" });
      }
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Transfer failed" });
    }
  });

  // Get all customers (manager only)
  app.get("/api/customers", async (req, res) => {
    if (!req.user || req.user.role !== "manager") {
      return res.status(403).send("Unauthorized");
    }
    const customers = await storage.getCustomers();
    res.json(customers);
  });

  const httpServer = createServer(app);
  return httpServer;
}