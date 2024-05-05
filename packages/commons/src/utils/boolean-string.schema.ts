import { z } from 'zod';

const booleanStringKeySchema = z.enum(['true', '1', 'false', '0']);

const stringToBooleanMap: Record<
  z.infer<typeof booleanStringKeySchema>,
  boolean
> = {
  true: true,
  '1': true,
  false: false,
  '0': false,
};

const booleanStringTransformer = (value: string, ctx: z.RefinementCtx) => {
  const validationResult = booleanStringKeySchema.safeParse(value, ctx);

  if (validationResult.success) {
    return stringToBooleanMap[validationResult.data];
  }

  validationResult.error.issues.forEach(ctx.addIssue);

  return z.NEVER;
};

/**
 * Returns a zod schema for parsing booleans from strings. i.e.
 *
 * - 'true' -> true
 * - '1' -> true
 * - 'false' -> false
 * - '0' -> false
 * - everything else throws a validation error
 *
 * @param defaultValue allows for a default value to be set.
 * @returns
 */
export const booleanStringSchema = (defaultValue?: boolean) => {
  if (defaultValue === undefined) {
    return z.string().transform(booleanStringTransformer);
  }

  return z
    .string()
    .default(defaultValue.toString())
    .transform(booleanStringTransformer);
};
