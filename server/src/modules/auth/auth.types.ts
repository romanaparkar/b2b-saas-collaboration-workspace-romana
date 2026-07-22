/**
 * Auth/user domain types.
 *
 * NOTE: This is a plain shape for the current stub implementation. In Phase 1
 * it is replaced by a Mongoose schema/model backed by MongoDB.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}
