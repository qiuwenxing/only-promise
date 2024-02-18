import { onlyPromise } from '../lib/main'

const getTime = (): Promise<number> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Date.now())
    }, 1000)
  })
}

const onlyGetTime = onlyPromise(getTime, 5000)

for (let i = 0; i < 3; i++) {
  onlyGetTime().then(res => {
    console.log('res', res)
  }).catch(err => {
    console.log('err', err)
  })
}

setTimeout(() => {
  onlyGetTime().then(res => {
    console.log('result1', res)
  })
}, 3000);

setTimeout(() => {
  onlyGetTime().then(res => {
    console.log('result2', res)
  })
}, 6000);