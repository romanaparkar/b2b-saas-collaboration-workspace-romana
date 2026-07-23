export type Role = "admin" | "member";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResult {
  user: User;
  token: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
