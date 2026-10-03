<p align="center">
  <img src="https://raw.githubusercontent.com/aykutkardas/lookie/main/logo.png" alt="Lookie" width="164" />
</p>

<p align="center">
  Store data in <code>localStorage</code> with an optional expiration time. Almost like a cookie.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/lookie"><img src="https://img.shields.io/npm/v/lookie?color=4fc921" alt="npm version" /></a>
  <a href="https://github.com/aykutkardas/lookie/actions/workflows/main.yml"><img src="https://github.com/aykutkardas/lookie/actions/workflows/main.yml/badge.svg" alt="Build status" /></a>  <a href="./LICENSE"><img src="https://img.shields.io/npm/l/lookie?color=4fc921" alt="License: MIT" /></a>
</p>

## Features

- **No manual `JSON.stringify` / `JSON.parse`.** Arrays, objects, numbers and booleans come back as they went in.
- **Expiry in any form:** milliseconds, `"1D 12h"`, `{ D: 1, h: 12 }` or a `Date`.
- **Safe everywhere:** doesn't throw during SSR, in private mode or when storage is full.
- **Plays well with others:** keys written without lookie are left alone.
- **Tiny:** no dependencies, TypeScript types included.

## Install

```sh
npm install lookie
```

## Quick start

```js
import lookie from "lookie";

lookie.set("theme", "dark");
lookie.set("session", { id: 42 }, "30m"); // expires in 30 minutes

lookie.get("theme"); // "dark"
lookie.get("session"); // { id: 42 }, or null after 30 minutes
```

> Using CommonJS? `const lookie = require("lookie").default;`

## API

### `set(key, value, expiry?)`

Stores `value` under `key`. `expiry` is optional; see [Expiry](#expiry).

```js
lookie.set("list", [1, 2, 3, 4]);
lookie.set("data", { key: "value" });
lookie.set("count", 1234);
lookie.set("muted", true);
lookie.set("user", null);

lookie.set("token", "abc", "1M 15D 20h"); // 1 month 15 days 20 hours
```

Returns `true` if the value was stored. Returns `false` if the key is empty, the value is `undefined`, or storage is full or unavailable.

### `setAll(object, expiry?)`

Stores every key of `object`, all with the same expiry.

```js
lookie.setAll({ theme: "dark", lang: "en" }, "1Y");
```

Returns `true` if every value was stored.

### `get(key)`

Returns the stored value, or `null` if the key doesn't exist or has expired. Expired data is deleted when you read it.

```js
lookie.get("list"); // [1, 2, 3, 4]

// TypeScript
lookie.get<number[]>("list");
```

Keys written without lookie (e.g. `localStorage.setItem("lang", "en")`) are returned as their raw string.

### `remove(key)`

```js
lookie.remove("theme");
```

### `sync()`

Expired data is only deleted when you read it with `get`. Call `sync` to remove every expired lookie entry at once, for example on app start. Keys not written by lookie are never touched.

```js
lookie.sync();
```

## Expiry

| Form      | Example                              | Meaning                    |
| --------- | ------------------------------------ | -------------------------- |
| `number`  | `60000`                              | 60 000 ms from now         |
| `string`  | `"1h30m"`, `"1D 12h"`, `"1.5D"`      | Duration from now          |
| `object`  | `{ D: 1, h: 12 }`                    | Duration from now          |
| `Date`    | `new Date("2030-01-01")`             | Expires at that moment     |

Omitting the expiry, or passing `0`, stores the data with no expiry.

### Units

| Unit | Name        |
| ---- | ----------- |
| `Y`  | Year        |
| `M`  | Month       |
| `D`  | Day         |
| `h`  | Hour        |
| `m`  | Minute      |
| `s`  | Second      |
| `ms` | Millisecond |

Units are case-sensitive: `M` is month, `m` is minute. A month counts as 30.44 days and a year as 365.24 days.

If an expiry can't be parsed (e.g. `"2days"`, `"1d"`, `"1w"`), lookie logs a warning and stores the data **without** expiry.

## Good to know

- **Only JSON-safe values survive.** Values are stored with `JSON.stringify`, so a `Date` comes back as a string, `Map` and `Set` come back as `{}`, and `BigInt` or circular objects throw.
- **SSR.** When `localStorage` isn't available, `set` returns `false` and `get` returns `null`. Nothing throws.
- **Security.** Any script on your page can read `localStorage`. Don't store tokens, passwords or other sensitive data in it.

## License

[MIT](./LICENSE) © Aykut Kardaş
