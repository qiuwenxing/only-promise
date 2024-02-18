export function onlyPromise<F extends (...args: any[]) => Promise<any>>(fn: F, cache?: number): (...args: Parameters<F>) => ReturnType<F>
