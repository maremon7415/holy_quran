/** Late-bound hooks the engine registers so the store can call into it without import cycles. */
export const audioBridge: { seekFraction?: (f: number) => void } = {}
