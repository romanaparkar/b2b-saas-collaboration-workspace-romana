import { Request, Response } from "express";

import { asyncHandler } from "../../middleware/asyncHandler";
import { AppError } from "../../shared/errors/AppError";
import { authService } from "./auth.service";

/** Thin controllers: parse request -> call service -> shape response. */

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: result,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    data: result,
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw AppError.unauthorized();
  }

  const user = await authService.getUserById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});
