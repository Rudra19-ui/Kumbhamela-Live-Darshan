import { api } from "./client";

export async function paged<T>(path: string): Promise<T[]> {
  const r = await api<{ results?: T[] } | T[]>(path);
  return Array.isArray(r) ? r : r.results ?? [];
}
