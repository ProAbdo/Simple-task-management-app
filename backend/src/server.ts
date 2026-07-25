import type { Server } from "node:http";

import { app } from "./app.js";
import {
  connectToDatabase,
  disconnectFromDatabase,
} from "./config/database.js";
import { env } from "./config/env.js";

let server: Server | undefined;

async function startServer(): Promise<void> {
  await connectToDatabase();

  server = app.listen(env.PORT, () => {
    console.log(`API listening on port ${env.PORT}`);
  });
}

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  console.log(`${signal} received. Shutting down gracefully.`);

  if (server) {
    await new Promise<void>((resolve, reject) => {
      server?.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  await disconnectFromDatabase();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

startServer().catch((error: unknown) => {
  console.error("Failed to start the API", error);
  process.exit(1);
});
