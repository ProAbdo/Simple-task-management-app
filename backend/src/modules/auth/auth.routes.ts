import { Router } from "express";

import {
  login,
  register,
} from "./auth.controller.js";
import { validateBody } from "../../shared/middleware/validation.middleware.js";
import {
  loginBodySchema,
  registerBodySchema,
} from "./auth.validation.js";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerBodySchema), register);
authRouter.post("/login", validateBody(loginBodySchema), login);
