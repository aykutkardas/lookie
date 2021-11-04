type MSTimeTable = {
  Y?: number;
  M?: number;
  D?: number;
  h?: number;
  m?: number;
  s?: number;
};

type ExpiryTime = number | string | MSTimeTable;

type Data = { value: any; expiry?: number };

export const MS_TIME_TABLE: MSTimeTable = {
  Y: 31556926000,
  M: 2629743830,
  D: 86400000,
  h: 3600000,
  m: 60000,
  s: 1000,
};

export const convertObjToMS = (timeObj: MSTimeTable): number => {
  let totalTime = 0;

  Object.keys(timeObj).forEach((key) => {
    const current = timeObj[key];

    if (current && typeof current === "number") {
      totalTime = current * MS_TIME_TABLE[key];
    }
  });

  return totalTime;
};

export const convertStringToMS = (timeStr: string): number => {
  const timeArr = timeStr.split(" ");
  let totalTime = 0;

  Object.keys(MS_TIME_TABLE).forEach((key) => {
    timeArr.forEach((time) => {
      if (time.indexOf(key) > -1 && parseInt(time)) {
        totalTime = parseInt(time) * MS_TIME_TABLE[key];
      }
    });
  });

  return totalTime;
};

class Lookie {
  static set = (key: string, value: any, expiryTime?: ExpiryTime): void => {
    if (!key || typeof value === "undefined") {
      return;
    }

    let expiryTimeMs = 0;

    if (expiryTime instanceof Object) {
      expiryTimeMs = convertObjToMS(expiryTime);
    } else if (typeof expiryTime === "string") {
      expiryTimeMs = convertStringToMS(expiryTime);
    } else if (typeof expiryTime === "number") {
      expiryTimeMs = expiryTime;
    }

    const now = new Date().getTime();
    const expiry = now + expiryTimeMs;

    const data: Data = { value };

    if (expiryTimeMs) {
      data.expiry = expiry;
    }

    localStorage.setItem(key, JSON.stringify(data));
  };

  static setAll = (obj: Object, expiryTime?: ExpiryTime): void => {
    if (typeof obj !== "object") return;

    Object.entries(obj).forEach(([key, value]) => {
      Lookie.set(key, value, expiryTime);
    });
  };

  static get = (key: string): any => {
    const dataStr = localStorage.getItem(key);

    if (!dataStr) {
      return null;
    }

    try {
      const item = JSON.parse(dataStr);
      const now = new Date().getTime();

      if (item.expiry) {
        if (now > item.expiry) {
          localStorage.removeItem(key);
          return null;
        }
      }

      return item.value;
    } catch (err) {
      return dataStr;
    }
  };

  static remove = (key: string): void => {
    localStorage.removeItem(key);
  };

  static sync = (): void => {
    Object.keys(localStorage).forEach((key) => Lookie.get(key));
  };
}

export default Lookie;
