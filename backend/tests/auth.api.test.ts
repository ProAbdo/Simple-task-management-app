import { describe, expect, it } from "vitest";

import { verifyPassword } from "../src/modules/auth/password.service.js";
import { UserModel } from "../src/modules/users/user.model.js";
import {
  app,
  request,
  registerTestUser,
} from "./helpers/api.helpers.js";

describe("authentication API", () => {
  it("registers a user, normalizes the email, and stores only a hash", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "  Test User  ",
        email: "  TEST.USER@Example.com ",
        password: "correct horse battery staple",
      });

    expect(response.status).toBe(201);
    expect(response.body.data.user).toMatchObject({
      name: "Test User",
      email: "test.user@example.com",
    });
    expect(response.body.data).toMatchObject({
      tokenType: "Bearer",
      expiresIn: "15m",
    });
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.user).not.toHaveProperty("passwordHash");

    const storedUser = await UserModel.findOne({
      email: "test.user@example.com",
    }).select("+passwordHash");

    expect(storedUser).not.toBeNull();
    expect(storedUser?.passwordHash).not.toBe(
      "correct horse battery staple",
    );
    await expect(
      verifyPassword(
        "correct horse battery staple",
        storedUser?.passwordHash ?? "",
      ),
    ).resolves.toBe(true);
  });

  it("rejects invalid registration data with field-level details", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "A",
        email: "invalid-email",
        password: "short",
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "name" }),
        expect.objectContaining({ field: "email" }),
        expect.objectContaining({ field: "password" }),
      ]),
    );
  });

  it("returns a clear client error for malformed JSON", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .set("content-type", "application/json")
      .send('{"email":');

    expect(response.status).toBe(400);
    expect(response.body.error).toMatchObject({
      code: "MALFORMED_JSON",
      message: "The request body contains invalid JSON",
    });
  });

  it("rejects duplicate email registration", async () => {
    const email = "duplicate@example.com";
    await registerTestUser({ email });

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Another User",
        email: email.toUpperCase(),
        password: "another secure password",
      });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("EMAIL_ALREADY_REGISTERED");
  });

  it("logs in with normalized credentials and rejects a wrong password", async () => {
    const registered = await registerTestUser({
      email: "login@example.com",
    });

    const successfulLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: " LOGIN@EXAMPLE.COM ",
        password: registered.credentials.password,
      });

    expect(successfulLogin.status).toBe(200);
    expect(successfulLogin.body.data.accessToken).toEqual(
      expect.any(String),
    );

    const rejectedLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "login@example.com",
        password: "incorrect password",
      });

    expect(rejectedLogin.status).toBe(401);
    expect(rejectedLogin.body.error).toMatchObject({
      code: "INVALID_CREDENTIALS",
      message: "The email or password is incorrect",
    });
  });
});
