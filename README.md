# lookie

[![npm](https://img.shields.io/npm/v/lookie?color=%234fc921)](https://www.npmjs.com/package/lookie)
[![Build Status](https://github.com/aykutkardas/lookie/workflows/build/badge.svg?color=%234fc921)](https://github.com/aykutkardas/lookie/actions)
[![License](https://img.shields.io/badge/License-MIT-green.svg?color=%234fc921)](https://opensource.org/licenses/MIT)

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

### Set

```js
lookie.set("key", value);
```

### Set (with Expiry)

```js
lookie.set("key", value, 10000); // 10 seconds

lookie.set("key", value, { s: 10 }); // 10 seconds

lookie.set("key", value, "10s"); // 10 seconds
```

### Set All

```js
lookie.setAll({ key: value, otherKey: otherValue });
```

### Set All (with Expiry)

```js
lookie.setAll({ key: value, otherKey: otherValue }, 10000); // 10 seconds

lookie.setAll({ key: value, otherKey: otherValue }, { s: 10 }); // 10 seconds

lookie.setAll({ key: value, otherKey: otherValue }, "10s"); // 10 seconds
```

> According to this example, when you want to get this data 10 seconds after setting, it will be deleted and you will not be able to access it.

### Get

```js
lookie.get("key");
```

### Remove

```js
lookie.remove("key");
```

### Sync

The data is checked only when called and deleted if the expiration date has passed. Therefore, even if they have expired, they continue to be stored until you call them. Just run this method if you want LocalStorage to stay up to date.

```js
lookie.sync();
```

## More Information About Expiry Support

### Available Time Ranges

| Key | Name   |
| --- | ------ |
| Y   | Year   |
| M   | Month  |
| D   | Day    |
| h   | Hour   |
| m   | Minute |
| s   | Second |

### Sample

```js
lookie.set("key", value, { M: 1, D: 15, h: 7 });
// 1 Month 15 Days 7 hours

lookie.set("key", value, "1M 15D 7h");
// 1 Month 15 Days 7 hours
```
