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

### Set

```js
lookie.set("key", value);
```

### Set with Expiry

```js
lookie.set("key", value, "1M 15D 20h"); // 1 month 30 days 20 hours
```

> According to this example, when you want to get this data `1 month 30 days 20 hours` after setting, it will be deleted and you will not be able to access it.

### Multiple Set

```js
lookie.setAll({ key: value, otherKey: otherValue });
```

### Multiple Set with Expiry

```js
lookie.setAll({ key: value, otherKey: otherValue }, "1M 15D 20h");
```

### Get

```js
lookie.get("key");
```

### Remove

```js
lookie.remove("key");
```

### Sync

Data is checked only when called and deleted if it has expired. Therefore, even if they have expired, they will continue to be stored until you call them. If you want LocalStorage to stay up to date, simply run this method.

Unless you have a special reason, you won't need it at all.

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
lookie.set("key", value, 1000); // 1 second

lookie.set("key", value, { s: 1 }); // 1 second

lookie.set("key", value, "1s"); // 1second
```
