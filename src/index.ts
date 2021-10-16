type MSTimeTableType = { [key: string]: number };

type TimeObjToMSFuncType = (timeObj: MSTimeTableType) => number;
type StringToMSFuncType = (timeStr: string) => number;
type SyncFuncType = () => void;
type GetFuncType = (key: string) => any;
type RemoveFuncType = (key: string) => void;
type SetFuncType = (
  key: string,
  value: any,
  expiryTime?: number | string | MSTimeTableType
) => void;

class Lookie {
  static msTimeTable: MSTimeTableType = {
    Y: 31556926000,
    M: 2629743830,
    D: 86400000,
    h: 3600000,
    m: 60000,
    s: 1000,
  };

  static set: SetFuncType = (key, value, expiryTime?) => {
    if (!key || typeof value === "undefined") {
      return;
    }

    let expiryTimeMs = 0;

    if (expiryTime instanceof Object) {
      expiryTimeMs = Lookie.timeObjToMs(expiryTime);
    } else if (typeof expiryTime === "string") {
      expiryTimeMs = Lookie.stringToMs(expiryTime);
    } else if (typeof expiryTime === "number") {
      expiryTimeMs = expiryTime;
    }

    const now = new Date().getTime();
    const expiry = now + expiryTimeMs;

    let data = value;

    if (expiryTimeMs) {
      data = JSON.stringify({
        value,
        expiry,
      });
    }

    if (typeof data !== "string") {
      data = JSON.stringify(data);
    }

    localStorage.setItem(key, data);
  };

  static get: GetFuncType = (key) => {
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
      } else {
        return item;
      }

      return item.value;
    } catch (err) {
      return dataStr;
    }
  };

  static remove: RemoveFuncType = (key) => {
    localStorage.removeItem(key);
  };

  static sync: SyncFuncType = () => {
    Object.keys(localStorage).forEach((key) => Lookie.get(key));
  };

  static timeObjToMs: TimeObjToMSFuncType = (timeObj) => {
    const msTimeTable = Lookie.msTimeTable;

    let totalTime = 0;

    Object.keys(timeObj).forEach((key) => {
      const current = timeObj[key];

      if (current && typeof current === "number") {
        totalTime = current * msTimeTable[key];
      }
    });

    return totalTime;
  };

  static stringToMs: StringToMSFuncType = (timeStr) => {
    const msTimeTable = Lookie.msTimeTable;
    const timeArr = timeStr.split(" ");
    let totalTime = 0;

    Object.keys(msTimeTable).forEach((key) => {
      timeArr.forEach((time) => {
        if (time.indexOf(key) > -1 && parseInt(time)) {
          totalTime = parseInt(time) * msTimeTable[key];
        }
      });
    });

    return totalTime;
  };
}

export default Lookie;
