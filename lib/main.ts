/**
 * 创建一个单例模式promise调用函数，多个地方调用同一个promise共享同一个实例
 * @param fn 需要封装的单例promise函数
 * @param cache 缓存时间，单位毫秒，如果大于0，则会缓存结果，默认不缓存，在缓存时间内下次调用会直接返回上次结果
 * @returns 
 */
export function onlyPromise<F extends (...args: any[]) => Promise<any>>(fn: F, cache = 0) {
  let promise: Promise<any> | null = null
  let cacheTime = -1
  let cacheResult: any = null
  function handlePromise(...args: Parameters<F>): ReturnType<F> {
    const now = Date.now()
    if (cache > 0) {
      if (now - cacheTime < cache) {
        return Promise.resolve(cacheResult) as ReturnType<F>
      } else {
        cacheTime = -1
        cacheResult = null
      }
    }
    if (promise) return promise as ReturnType<F>
    promise = fn(...args)
    return promise.then(res => {
      if (cache > 0) {
        cacheTime = Date.now()
        cacheResult = res
      }
      return res
    }).finally(() => {
      promise = null
    }) as ReturnType<F>
  }
  return handlePromise
}