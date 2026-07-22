/**
 * Workspace domain type.
 *
 * NOTE: Plain shape for the current in-memory stub. Replaced by a Mongoose
 * schema/model (persisted, user-scoped) in Phase 2.
 */
export interface Workspace {
  id: string;
  name: string;
  description: string;
}
