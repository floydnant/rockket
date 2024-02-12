/* eslint-disable @typescript-eslint/ban-types */
import { CombineObjectUnion } from './object.utils'
import { ToString } from './string.utils'

type FlattenObjRecurser<
    TPrevPath extends string,
    TCurrKey extends string,
    TPrevResult extends object,
    TCurrValue,
    TExitType,
> = TCurrValue extends object
    ? // @TODO: Arrays don't work as exit types for some reason, fix it
      TCurrValue extends TExitType
        ? TPrevResult & {
              [Key in `${TPrevPath}${'' extends TPrevPath ? '' : '.'}${TCurrKey}`]: TCurrValue
          }
        : {
              [Key in keyof TCurrValue]: FlattenObjRecurser<
                  `${TPrevPath}${'' extends TPrevPath ? '' : '.'}${TCurrKey}`,
                  // "casting" the key to string is necessary because `keyof TCurrValue` is `string | number | symbol`
                  ToString<Key>,
                  TPrevResult,
                  TCurrValue[Key],
                  TExitType
              >
          }[keyof TCurrValue]
    : TPrevResult & {
          [Key in `${TPrevPath}${'' extends TPrevPath ? '' : '.'}${TCurrKey}`]: TCurrValue
      }

export type FlattenObject<
    T extends object,
    TPrefix extends string = '',
    TExitType = Function,
> = CombineObjectUnion<FlattenObjRecurser<'', TPrefix, object, T, TExitType>>

const isFunction = (value: unknown): value is Function => value instanceof Function

/**
 * Flattens an object to a single level while concatenating the key paths with a dot. i.e.
 * ```ts
 * const input = {
 *      a: {
 *          b: {
 *              c: 'value'
 *          },
 *          error: {
 *              status: 123,
 *              code: 'some error code'
 *          }
 *      }
 * }
 *
 * const result = flattenObject(input)
 * type Result = {
 *     'a.b.c': 'value',
 *     'a.b.error.status': 123,
 *     'a.b.error.code': 'some error code'
 * }
 *
 * const prefixedResult = flattenObject(input, 'a-prefix')
 * type PrefixedResult = {
 *     'a-prefix.a.b.c': 'value',
 *     'a-prefix.a.b.error.status': 123,
 *     'a-prefix.a.b.error.code': 'some error code'
 * }
 *
 * const exitPredicate = (value: unknown): value is { status: number } =>
 *     typeof value == 'object' &&
 *     !!value &&
 *     'status' in value
 * const resultWithCustomExit = flattenObject(input, '', exitPredicate)
 * type ResultWithCustomExit = {
 *     'a.b.c': 'value',
 *     'a.b.error': {
 *          status: 123,
 *          code: 'some error code'
 *     },
 * }
 * ```
 * @param obj the input object
 * @param prefix an optional prefix to apply
 * @param exitPredicate a function used to determine a custom exit type, e.g. when wanting to preserve certain object structures in the tree. See more in the example.
 */
export const flattenObject = <T extends object, TPrefix extends string = '', TExitType = never>(
    obj: T,
    prefix?: TPrefix,
    exitPredicate?: (value: unknown) => value is TExitType,
): FlattenObject<T, TPrefix, TExitType | Function> => {
    type ResultObj = FlattenObject<T, TPrefix, TExitType | Function>

    const flattend = Object.entries(obj).reduce((acc, [key, value]) => {
        const prefix_ = prefix ? prefix + '.' : ''

        if (
            typeof value == 'string' ||
            typeof value == 'number' ||
            typeof value == 'boolean' ||
            // @TODO: add back in once array exit type works properly, see FlattenObjRecurser for more info
            // Array.isArray(value) ||
            isFunction(value) ||
            exitPredicate?.(value)
        ) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            acc[(prefix_ + key) as keyof ResultObj] = value as any
            return acc
        }

        return {
            ...acc,
            ...flattenObject(value, prefix_ + key, exitPredicate),
        }
    }, {} as ResultObj)

    return flattend
}

flattenObject({}, '')
