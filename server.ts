import 'dotenv/config';
import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { createServer as createHttpServer } from "http";
import { setupSocket } from "./backend/socket.ts";
import healthRoutes from "./backend/routes/health.ts";
import authRoutes from "./backend/routes/auth.ts";
import dashboardRoutes from "./backend/routes/dashboard.ts";
import leadRoutes from "./backend/routes/leads.ts";
import taskRoutes from "./backend/routes/tasks.ts";
import serviceRoutes from "./backend/routes/services.ts";
import proposalRoutes from "./backend/routes/proposals.ts";
import projectRoutes from "./backend/routes/projects.ts";
import analyticsRoutes from "./backend/routes/analytics.ts";
import notificationRoutes from "./backend/routes/notifications.ts";
import aiRoutes from "./backend/routes/ai.ts";
import searchRoutes from "./backend/routes/search.ts";

async function startServer() {
  const app = express();
const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === "production";

  // Security
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cookieParser());

  const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:3000",
    "http://0.0.0.0:3000",
  ].filter(Boolean) as string[];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || !isProd) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: ${origin} not allowed`));
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: "10kb" }));

  // Rate limiting
  app.use("/api/", rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
  app.use("/api/auth/login", rateLimit({ windowMs: 60 * 60 * 1000, max: 10 }));
  app.use("/api/auth/register", rateLimit({ windowMs: 60 * 60 * 1000, max: 10 }));

  // API routes
  app.use("/api/health", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/leads", leadRoutes);
  app.use("/api/tasks", taskRoutes);
  app.use("/api/services", serviceRoutes);
  app.use("/api/proposals", proposalRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/search", searchRoutes);

  // Dev: Vite middleware | Prod: serve built frontend
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const httpServer = createHttpServer(app);
  setupSocket(httpServer);

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running at http://0.0.0.0:${PORT} [${isProd ? "production" : "development"}]`);
  });
}

startServer().catch((err) => {
  console.error("❌ Server Start Error:", err);
  process.exit(1);
});
