export const enumInvalidMessage = (fieldName: string, enumValue: Record<string, string>) => ({
    message: `${fieldName} must be one of: ${Object.values(enumValue).join(', ')}`,
})
