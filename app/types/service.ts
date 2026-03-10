import type { User } from "./user"

export type GetSessionResponse = {
  user: User;
}

export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}