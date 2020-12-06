# lookie

It allows you to call the data in localStorage by parsing and save it by converting it to string. You can also specify a expirytime for the data you define.

## Install

```
npm install lookie
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

> According to this example, when you want to get this data 10 seconds after setting, it will be deleted and you will not be able to access it.

### Get

```js
lookie.get("key");
```

### Remove
```js
lookie.remove("key");
```

## Advanced

```js
lookie.set("key", value, { M: 1, D: 15, h: 7 });
// 1 Month 15 Days 7 hours

lookie.set("key", value, "1M 15D 7h");
// 1 Month 15 Days 7 hours
```

### Available Time Ranges

| Key | Name   |
|-----|--------|
| Y   | Year   |
| M   | Month  |
| D   | Day    |
| h   | Hour   |
| m   | Minute |
| s   | Second |
