[![npm](https://img.shields.io/npm/v/lookie?color=%234fc921)](https://www.npmjs.com/package/lookie)
[![Build Status](https://github.com/aykutkardas/lookie/workflows/build/badge.svg?color=%234fc921)](https://github.com/aykutkardas/lookie/actions)
[![License](https://img.shields.io/badge/License-MIT-green.svg?color=%234fc921)](https://opensource.org/licenses/MIT)

![Lookie](./logo.png)

You can store your data in LocalStorage without converting it to string. You can specify how long this data will be stored in LocalStorage. Lookie is a small package without dependencies and has type support.

## Install

```
npm install lookie
```

```
yarn add lookie
```

## Usage

### Import

```js
import lookie from "lookie";
```

### **Set**

Values are serialized with `JSON.stringify`, so you can give values such as `array`, `object`, `boolean`, `number`, `null` or `string`.

> Values that JSON can't represent are not preserved: a `Date` comes back as a string, `Map`/`Set` come back as `{}`, and `BigInt` or circular objects throw.

`set` returns `true` when the data is stored, and `false` when it isn't (empty key, `undefined` value, storage full or unavailable).

```js
lookie.set("list", [1, 2, 3, 4]);

lookie.set("data", { key: "value" });

lookie.set("count", 1234);

lookie.set("muted", true);

lookie.set("theme", "dark");

lookie.set("user", null);
```

### **Set with Expiry**

```js
lookie.set("key", value, "1M 15D 20h"); // 1 month 15 days 20 hours
```

> According to this example, when you want to get this data `1 month 15 days 20 hours` after setting, it will be deleted and you will not be able to access it.

### **Multiple Set**

```js
lookie.setAll({ key: value, otherKey: otherValue });
```

### **Multiple Set with Expiry**

```js
lookie.setAll({ key: value, otherKey: otherValue }, "1M 15D 20h");
```

### **Get**

```js
lookie.get("key");

// TypeScript
lookie.get<string[]>("list");
```

Returns `null` if the key doesn't exist or has expired. Keys written without lookie (e.g. `localStorage.setItem("theme", "dark")`) are returned as their raw string.

### **Remove**

```js
lookie.remove("key");
```

### **Sync**

Data is checked only when called and deleted if it has expired. Therefore, even if they have expired, they will continue to be stored until you call them. If you want LocalStorage to stay up to date, simply run this method.

Unless you have a special reason, you won't need it at all.

```js
lookie.sync();
```

Only data written by lookie is checked; other keys in LocalStorage are left untouched.

### **Server-Side Rendering**

When `localStorage` is not available (SSR, disabled storage), lookie doesn't throw: `set` returns `false`, `get` returns `null`.

## More Information About Expiry Support

### **Available Time Ranges**

| Key | Name        |
| --- | ----------- |
| Y   | Year        |
| M   | Month       |
| D   | Day         |
| h   | Hour        |
| m   | Minute      |
| s   | Second      |
| ms  | Millisecond |

Units are case-sensitive (`M` is month, `m` is minute). A month is 30.44 days and a year is 365.24 days.

### **Examples**

```js
lookie.set("key", value, 1000); // 1 second

lookie.set("key", value, { s: 1 }); // 1 second

lookie.set("key", value, "1s"); // 1 second

lookie.set("key", value, "1h30m"); // 1 hour 30 minutes

lookie.set("key", value, "1.5D"); // 36 hours

lookie.set("key", value, new Date("2030-01-01")); // until a specific date
```

If the expiry can't be parsed (e.g. `"2days"`, `"1d"`, `"1w"`), a warning is logged and the data is stored **without** expiry.

## Security

LocalStorage can be read by any script running on your page. Don't store tokens, passwords or other sensitive data in it.
