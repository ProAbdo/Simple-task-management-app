import { beforeEach, describe, expect, it } from "vitest";

import {
  TaskPriority,
  TaskStatus,
} from "../src/modules/tasks/task.enums.js";
import {
  app,
  authenticatedRequest,
  buildTaskPayload,
  createTestTask,
  registerTestUser,
  request,
} from "./helpers/api.helpers.js";

describe("tasks API", () => {
  let ownerToken: string;
  let otherUserToken: string;

  beforeEach(async () => {
    ownerToken = (await registerTestUser()).token;
    otherUserToken = (await registerTestUser()).token;
  });

  it("requires authentication for the task module", async () => {
    const response = await request(app).get("/api/v1/tasks");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("AUTHENTICATION_REQUIRED");
  });

  it("rejects an invalid access token", async () => {
    const response = await authenticatedRequest("not-a-valid-jwt").get(
      "/api/v1/tasks",
    );

    expect(response.status).toBe(401);
    expect(response.body.error).toMatchObject({
      code: "INVALID_TOKEN",
      message: "The access token is invalid",
    });
  });

  it("supports the complete owner CRUD lifecycle", async () => {
    const createResponse = await authenticatedRequest(ownerToken)
      .post("/api/v1/tasks")
      .send(buildTaskPayload({ priority: TaskPriority.High }));

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.task).toMatchObject({
      title: "Prepare assignment",
      status: TaskStatus.Todo,
      priority: TaskPriority.High,
    });
    expect(createResponse.body.data.task).not.toHaveProperty("owner");

    const taskId = createResponse.body.data.task.id as string;

    const listResponse = await authenticatedRequest(ownerToken).get(
      "/api/v1/tasks",
    );
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data.tasks).toHaveLength(1);

    const getResponse = await authenticatedRequest(ownerToken).get(
      `/api/v1/tasks/${taskId}`,
    );
    expect(getResponse.status).toBe(200);

    const updateResponse = await authenticatedRequest(ownerToken)
      .patch(`/api/v1/tasks/${taskId}`)
      .send({
        title: "Complete assignment",
        status: TaskStatus.InProgress,
      });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.task).toMatchObject({
      title: "Complete assignment",
      status: TaskStatus.InProgress,
    });

    const deleteResponse = await authenticatedRequest(ownerToken).delete(
      `/api/v1/tasks/${taskId}`,
    );
    expect(deleteResponse.status).toBe(204);
    expect(deleteResponse.text).toBe("");

    const deletedResponse = await authenticatedRequest(ownerToken).get(
      `/api/v1/tasks/${taskId}`,
    );
    expect(deletedResponse.status).toBe(404);
  });

  it("prevents another user from discovering or changing a task", async () => {
    const task = await createTestTask(ownerToken);

    const otherUserList = await authenticatedRequest(otherUserToken).get(
      "/api/v1/tasks",
    );
    expect(otherUserList.body.data.tasks).toHaveLength(0);

    const read = await authenticatedRequest(otherUserToken).get(
      `/api/v1/tasks/${task.id}`,
    );
    const update = await authenticatedRequest(otherUserToken)
      .patch(`/api/v1/tasks/${task.id}`)
      .send({ status: TaskStatus.Done });
    const remove = await authenticatedRequest(otherUserToken).delete(
      `/api/v1/tasks/${task.id}`,
    );

    for (const response of [read, update, remove]) {
      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe("TASK_NOT_FOUND");
    }
  });

  it("validates task bodies, update bodies, and task IDs", async () => {
    const invalidCreate = await authenticatedRequest(ownerToken)
      .post("/api/v1/tasks")
      .send({
        ...buildTaskPayload(),
        title: "",
        status: "blocked",
        dueDate: "not-a-date",
      });
    expect(invalidCreate.status).toBe(400);
    expect(invalidCreate.body.error.code).toBe("VALIDATION_ERROR");

    const task = await createTestTask(ownerToken);
    const emptyUpdate = await authenticatedRequest(ownerToken)
      .patch(`/api/v1/tasks/${task.id}`)
      .send({});
    expect(emptyUpdate.status).toBe(400);

    const invalidId = await authenticatedRequest(ownerToken).get(
      "/api/v1/tasks/not-a-mongo-id",
    );
    expect(invalidId.status).toBe(400);
  });

  it("searches and filters owner tasks with validated query parameters", async () => {
    await createTestTask(ownerToken, {
      title: "Prepare Assignment",
      status: TaskStatus.Todo,
      priority: TaskPriority.High,
    });
    await createTestTask(ownerToken, {
      title: "Review API",
      status: TaskStatus.InProgress,
      priority: TaskPriority.Medium,
    });
    await createTestTask(ownerToken, {
      title: "Release v1.0 [final]",
      status: TaskStatus.Done,
      priority: TaskPriority.High,
    });
    await createTestTask(otherUserToken, {
      title: "Release another version",
      status: TaskStatus.Done,
      priority: TaskPriority.High,
    });

    const search = await authenticatedRequest(ownerToken).get(
      "/api/v1/tasks?search=ASSIGNMENT",
    );
    expect(search.body.data.tasks).toHaveLength(1);
    expect(search.body.data.tasks[0].title).toBe("Prepare Assignment");

    const literalSearch = await authenticatedRequest(ownerToken).get(
      "/api/v1/tasks?search=%5Bfinal%5D",
    );
    expect(literalSearch.body.data.tasks).toHaveLength(1);

    const combined = await authenticatedRequest(ownerToken).get(
      `/api/v1/tasks?search=release&status=${TaskStatus.Done}&priority=${TaskPriority.High}`,
    );
    expect(combined.body.data.tasks).toHaveLength(1);
    expect(combined.body.data.tasks[0].title).toBe(
      "Release v1.0 [final]",
    );

    const invalidStatus = await authenticatedRequest(ownerToken).get(
      "/api/v1/tasks?status=blocked",
    );
    expect(invalidStatus.status).toBe(400);

    const invalidPage = await authenticatedRequest(ownerToken).get(
      "/api/v1/tasks?page=0",
    );
    expect(invalidPage.status).toBe(400);

    const invalidLimit = await authenticatedRequest(ownerToken).get(
      "/api/v1/tasks?limit=31",
    );
    expect(invalidLimit.status).toBe(400);

    const unknownParameter = await authenticatedRequest(ownerToken).get(
      "/api/v1/tasks?sort=title",
    );
    expect(unknownParameter.status).toBe(400);
  });

  it("paginates task results and returns navigation metadata", async () => {
    await Promise.all(
      Array.from({ length: 11 }, (_, index) =>
        createTestTask(ownerToken, {
          title: `Task ${index + 1}`,
        }),
      ),
    );
    await createTestTask(otherUserToken, {
      title: "Another user's task",
    });

    const firstPage = await authenticatedRequest(ownerToken).get(
      "/api/v1/tasks?page=1&limit=5",
    );

    expect(firstPage.status).toBe(200);
    expect(firstPage.body.data.tasks).toHaveLength(5);
    expect(firstPage.body.data.pagination).toEqual({
      page: 1,
      limit: 5,
      totalItems: 11,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: false,
    });

    const lastPage = await authenticatedRequest(ownerToken).get(
      "/api/v1/tasks?page=3&limit=5",
    );

    expect(lastPage.status).toBe(200);
    expect(lastPage.body.data.tasks).toHaveLength(1);
    expect(lastPage.body.data.pagination).toMatchObject({
      page: 3,
      totalItems: 11,
      totalPages: 3,
      hasNextPage: false,
      hasPreviousPage: true,
    });
  });

  it("uploads, downloads, and deletes an owned task attachment", async () => {
    const task = await createTestTask(ownerToken);

    const upload = await authenticatedRequest(ownerToken)
      .post(`/api/v1/tasks/${task.id}/attachments`)
      .attach("file", Buffer.from("project notes"), {
        filename: "notes.txt",
        contentType: "text/plain",
      });

    expect(upload.status).toBe(201);
    expect(upload.body.data.task.attachments).toHaveLength(1);
    expect(upload.body.data.task.attachments[0]).toMatchObject({
      fileName: "notes.txt",
      mimeType: "text/plain",
      size: 13,
    });
    expect(upload.body.data.task.attachments[0]).not.toHaveProperty(
      "storedName",
    );

    const attachmentId = upload.body.data.task.attachments[0].id as string;
    const download = await authenticatedRequest(ownerToken).get(
      `/api/v1/tasks/${task.id}/attachments/${attachmentId}`,
    );

    expect(download.status).toBe(200);
    expect(download.headers["content-disposition"]).toContain(
      'filename="notes.txt"',
    );
    expect(download.text).toBe("project notes");

    const otherUserDownload = await authenticatedRequest(otherUserToken).get(
      `/api/v1/tasks/${task.id}/attachments/${attachmentId}`,
    );
    expect(otherUserDownload.status).toBe(404);
    expect(otherUserDownload.body.error.code).toBe("TASK_NOT_FOUND");

    const remove = await authenticatedRequest(ownerToken).delete(
      `/api/v1/tasks/${task.id}/attachments/${attachmentId}`,
    );
    expect(remove.status).toBe(204);

    const removedDownload = await authenticatedRequest(ownerToken).get(
      `/api/v1/tasks/${task.id}/attachments/${attachmentId}`,
    );
    expect(removedDownload.status).toBe(404);
    expect(removedDownload.body.error.code).toBe("ATTACHMENT_NOT_FOUND");
  });

  it("validates attachment presence, type, and size", async () => {
    const task = await createTestTask(ownerToken);

    const missingFile = await authenticatedRequest(ownerToken).post(
      `/api/v1/tasks/${task.id}/attachments`,
    );
    expect(missingFile.status).toBe(400);
    expect(missingFile.body.error.code).toBe("ATTACHMENT_REQUIRED");

    const unsupportedType = await authenticatedRequest(ownerToken)
      .post(`/api/v1/tasks/${task.id}/attachments`)
      .attach("file", Buffer.from("binary"), {
        filename: "program.exe",
        contentType: "application/octet-stream",
      });
    expect(unsupportedType.status).toBe(415);
    expect(unsupportedType.body.error.code).toBe(
      "UNSUPPORTED_ATTACHMENT_TYPE",
    );

    const oversizedFile = await authenticatedRequest(ownerToken)
      .post(`/api/v1/tasks/${task.id}/attachments`)
      .attach("file", Buffer.alloc(5 * 1024 * 1024 + 1), {
        filename: "large.txt",
        contentType: "text/plain",
      });
    expect(oversizedFile.status).toBe(413);
    expect(oversizedFile.body.error.code).toBe("ATTACHMENT_TOO_LARGE");
  });
});
