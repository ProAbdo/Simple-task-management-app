import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { afterAll, afterEach } from "vitest";

const mongoServer = await MongoMemoryServer.create();
const uploadDirectory = mkdtempSync(
  join(tmpdir(), "electro-pi-attachments-"),
);

process.env.NODE_ENV = "test";
process.env.MONGODB_URI = mongoServer.getUri("electro_pi_api_tests");
process.env.JWT_SECRET = "test-secret-that-is-at-least-32-characters-long";
process.env.JWT_EXPIRES_IN = "15m";
process.env.BCRYPT_SALT_ROUNDS = "10";
process.env.CORS_ORIGIN = "http://localhost:5173";
process.env.UPLOAD_DIRECTORY = uploadDirectory;
process.env.MAX_ATTACHMENT_SIZE_MB = "5";

const { connectToDatabase, disconnectFromDatabase } = await import(
  "../src/config/database.js"
);
const { UserModel } = await import(
  "../src/modules/users/user.model.js"
);
const { TaskModel } = await import(
  "../src/modules/tasks/task.model.js"
);

await connectToDatabase();
await Promise.all([UserModel.init(), TaskModel.init()]);

afterEach(async () => {
  await Promise.all(
    Object.values(mongoose.connection.collections).map((collection) =>
      collection.deleteMany({}),
    ),
  );
});

afterAll(async () => {
  await disconnectFromDatabase();
  await mongoServer.stop();
  rmSync(uploadDirectory, { recursive: true, force: true });
});
