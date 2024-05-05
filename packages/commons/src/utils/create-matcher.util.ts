import { entriesOf } from './object.utils'

export const createMatcher = <TCaseKey extends string, TInput, TExtraArgs extends unknown[] = never[]>() => {
    const createAsyncMatcher = <TReturn>(
        cases: Record<
            TCaseKey,
            (
                input: TInput,
                ...args: TExtraArgs
            ) => TReturn | Promise<TReturn | void | undefined> | void | undefined
        > & {
            default: (input: TInput, ...args: TExtraArgs) => TReturn
        },
    ) => {
        const match = async (input: TInput, ...args: TExtraArgs): Promise<TReturn> => {
            for (const [key, tryCase] of entriesOf(cases)) {
                if (key == 'default') continue

                const result = await tryCase(input, ...args)
                if (result === undefined) continue

                return result
            }

            return cases.default(input, ...args)
        }

        return { match, cases }
    }

    const createSyncMatcher = <TReturn>(
        cases: Record<TCaseKey, (input: TInput, ...args: TExtraArgs) => TReturn | void | undefined> & {
            default: (input: TInput, ...args: TExtraArgs) => TReturn
        },
    ) => {
        const match = (input: TInput, ...args: TExtraArgs): TReturn => {
            for (const [key, tryCase] of entriesOf(cases)) {
                if (key == 'default') continue

                const result = tryCase(input, ...args)
                if (result === undefined) continue

                return result
            }

            return cases.default(input, ...args)
        }

        return { match, cases }
    }

    const createDiscriminatedAsyncMatcher = <TReturn, TDiscriminator extends keyof TInput>(
        discriminator: TDiscriminator,
        cases: {
            [KCaseKey in TCaseKey]: (
                ...args: TExtraArgs extends never[]
                    ? [input: Extract<TInput, { [K in TDiscriminator]: KCaseKey }>]
                    : [input: Extract<TInput, { [K in TDiscriminator]: KCaseKey }>, ...args: TExtraArgs]
            ) => TReturn | Promise<TReturn>
        },
    ) => {
        const match = async (...args: [input: TInput, ...args: TExtraArgs]): Promise<TReturn> => {
            const [input, ...restArgs] = args
            const caseKey = input[discriminator] as TCaseKey
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return await (cases[caseKey] as any)(input, ...restArgs)
        }

        return { match, cases }
    }

    return {
        withAsyncCases: createAsyncMatcher,
        withSyncCases: createSyncMatcher,
        withDiscriminatedAsyncCases: createDiscriminatedAsyncMatcher,
    }
}
