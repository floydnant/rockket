export const isTruthy = <T>(value: T | undefined | null | false | 0 | ''): value is T => Boolean(value)

export const assertUnreachable = (_: never, message?: string): never => {
    throw new Error(message || "You've reached an unreachable point in the code. How? 🤔")
}
