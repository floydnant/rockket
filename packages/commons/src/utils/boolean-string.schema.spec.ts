import { ZodError } from 'zod';
import { booleanStringSchema } from './boolean-string.schema';

describe(`${booleanStringSchema.name}()`, () => {
  it('returns true for "true" and "1"', () => {
    const result1 = booleanStringSchema().parse('true');
    const result2 = booleanStringSchema().parse('1');

    expect(result1).toEqual(true);
    expect(result2).toEqual(true);
  });

  it('returns false for "false" and "0"', () => {
    const result1 = booleanStringSchema().parse('false');
    const result2 = booleanStringSchema().parse('0');

    expect(result1).toEqual(false);
    expect(result2).toEqual(false);
  });

  it('throws for other values', () => {
    expect(() => booleanStringSchema().parse('not-a-boolean')).toThrow(
      ZodError
    );
    expect(() => booleanStringSchema().parse(undefined)).toThrow(ZodError);
  });

  it('returns default if given', () => {
    expect(booleanStringSchema(true).parse(undefined)).toEqual(true);
  });
});
