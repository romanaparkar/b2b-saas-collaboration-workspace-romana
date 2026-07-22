import { Request, Response } from "express";

/**
 * STUB implementation — returns canned responses so the frontend can integrate.
 * Real password hashing (bcrypt) and JWT issuing are implemented in Phase 1.
 */

export const registerUser = async (req: Request, res: Response) => {
  const { name, email } = req.body;

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: {
      name,
      email,
    },
  });
};

export const loginUser = async (req: Request, res: Response) => {
  const { email } = req.body;

  res.status(200).json({
    success: true,
    message: "Login successful",
    token: "dummy-jwt-token",
    user: {
      email,
    },
  });
};
