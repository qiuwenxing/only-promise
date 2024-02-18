# only-promise

创建一个单例模式`Promise`调用函数，多处地方在同一时间调用同一个`Promise`函数时共享同一个`Promise`实例

## 使用

### npm 安装

```bash
npm install only-promise -S
```

### 使用方法

```javascript
import { onlyPromise } from "only-promise";

const getTime = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Date.now());
    }, 1000);
  });
};

const onlyGetTime = onlyPromise(getTime);

onlyGetTime().then((res) => {
  console.log("res", res);
});
```

## Example

### test1

```javascript
import { onlyPromise } from "only-promise";

const getTime = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Date.now());
    }, 1000);
  });
};
// 不设置缓存时间
const onlyGetTime = onlyPromise(getTime);

for (let i = 0; i < 3; i++) {
  onlyGetTime()
    .then((res) => {
      console.log("res", res);
    })
    .catch((err) => {
      console.log("err", err);
    });
}

setTimeout(() => {
  onlyGetTime().then((res) => {
    console.log("result", res);
  });
}, 3000);

// res 1708251128183
// res 1708251128183
// res 1708251128183
// result 1708251131201
```

### test2

```javascript
import { onlyPromise } from "only-promise";

const getTime = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Date.now());
    }, 1000);
  });
};
// 设置缓存时间5秒，单位毫秒
const onlyGetTime = onlyPromise(getTime, 5000);

for (let i = 0; i < 3; i++) {
  onlyGetTime()
    .then((res) => {
      console.log("res", res);
    })
    .catch((err) => {
      console.log("err", err);
    });
}

setTimeout(() => {
  onlyGetTime().then((res) => {
    console.log("result1", res);
  });
}, 3000);

setTimeout(() => {
  onlyGetTime().then((res) => {
    console.log("result2", res);
  });
}, 6000);

// res 1708251344268
// res 1708251344268
// res 1708251344268
// result1 1708251344268  在缓存时间内的结果保持不变
// result2 1708251350275  超过缓存时间的结果会才会变化
```

### token 无感刷新，这里只做简单处理，实际场景会更复杂一些

```javascript
import axios from "axios";
import { onlyPromise } from "only-promise";
import Cookies from "js-cookie";
import * as jwt from "jsonwebtoken";

const http = axios.create({});

const getAccessToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("新的access token：" + Date.now());
    }, 1500);
  });
};
// 由于可能会同时发起多个请求，如果不使用该方式会导致多次刷新token
const singleGetAccessToken = onlyPromise(getAccessToken);

http.interceptors.request.use(async (config) => {
  const token = Cookies.get("accessToken");
  if (!token) return config;
  // 解析token内容
  const jwtData = jwt.decode(token, { complete: true });
  if (jwtData && jwtData.payload) {
    const tokenData = jwtData.payload;
    const curNowTime = Date.now() / 1000;
    // 判断token是否已过期，如果已过期就重新获取新token
    if (tokenData.exp < curNowTime) {
      const refreshToken = Cookies.get("refreshToken");
      const newToken = await singleGetAccessToken(refreshToken);
      Cookies.set("accessToken", newToken);
      config.headers["Authorization"] = newToken;
    }
  }
  return config;
});
```
