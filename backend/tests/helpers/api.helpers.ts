import { randomUUID } from "node:crypto";

import request from "supertest";

import { app } from "../../src/app.js";
import {
  TaskPriority,
  TaskStatus,
} from "../../src/modules/tasks/task.enums.js";

interface RegistrationOverrides {
  name?: string;
  email?: string;
  password?: string;
}

interface TaskOverrides {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}

export function authenticatedRequest(token: string) {
  return {
    get: (path: string) =>
      request(app).get(path).set("authorization", `Bearer ${token}`),
    post: (path: string) =>
      request(app).post(path).set("authorization", `Bearer ${token}`),
    patch: (path: string) =>
      request(app).patch(path).set("authorization", `Bearer ${token}`),
    delete: (path: string) =>
      request(app).delete(path).set("authorization", `Bearer ${token}`),
  };
}

export async function registerTestUser(
  overrides: RegistrationOverrides = {},
) {
  const uniqueId = randomUUID();
  const credentials = {
    name: overrides.name ?? "Test User",
    email: overrides.email ?? `${uniqueId}@example.com`,
    password: overrides.password ?? "correct horse battery staple",
  };

  const response = await request(app)
    .post("/api/v1/auth/register")
    .send(credentials);

  if (response.status !== 201) {
    throw new Error(
      `Unable to register test user: ${JSON.stringify(response.body)}`,
    );
  }

  return {
    credentials,
    token: response.body.data.accessToken as string,
    user: response.body.data.user as {
      id: string;
      name: string;
      email: string;
    },
  };
}

export function buildTaskPayload(overrides: TaskOverrides = {}) {
  return {
    title: overrides.title ?? "Prepare assignment",
    description:
      overrides.description ?? "Complete the backend implementation",
    status: overrides.status ?? TaskStatus.Todo,
    priority: overrides.priority ?? TaskPriority.Medium,
    dueDate: overrides.dueDate ?? "2026-08-01T18:00:00.000Z",
  };
}

export async function createTestTask(
  token: string,
  overrides: TaskOverrides = {},
) {
  const response = await authenticatedRequest(token)
    .post("/api/v1/tasks")
    .send(buildTaskPayload(overrides));

  if (response.status !== 201) {
    throw new Error(
      `Unable to create test task: ${JSON.stringify(response.body)}`,
    );
  }

  return response.body.data.task as {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string;
    attachments: Array<{
      id: string;
      fileName: string;
      mimeType: string;
      size: number;
      uploadedAt: string;
    }>;
  };
}

export { request, app };
