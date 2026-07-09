import { Request, Response } from "express";

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

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