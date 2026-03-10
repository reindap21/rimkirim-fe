export type PrimeFormField<T> = {
  value: T
  invalid: boolean
  error?: { message?: string }
}

export type PrimeFormInstance<T> = {
  [K in keyof T]: PrimeFormField<T[K]>
}
