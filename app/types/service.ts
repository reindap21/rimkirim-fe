import type { UserType } from "./user"

export type GetSessionResponse = {
  user: UserType;
}

export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}