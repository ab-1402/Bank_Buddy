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
