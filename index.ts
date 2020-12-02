type TimeObjType = { [key: string]: number };

class Lookie {
  static set(
    key: string,
    value: any,
    expiryTime?: number | string | TimeObjType
  ) {
    if (!key || !value) {
      return;
    }

    let expiryTimeMs = 0;

    if (expiryTime instanceof Object) {
      expiryTimeMs = this.timeObjToMs(expiryTime);
    } else if (typeof expiryTime === "string") {
      expiryTimeMs = this.stringToMs(expiryTime);
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

    localStorage.setItem(key, data);
  }

  static get(key: string) {
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
    } catch () {
      return dataStr;
    }

  }

  static getTimeTable(): TimeObjType {
    return {
      Y: 31556926,
      M: 2629743.83,
      D: 86400,
      h: 3600,
      m: 60,
      s: 1,
    };
  }

  static timeObjToMs(timeObj: TimeObjType): number {
    const timeTable: TimeObjType = this.getTimeTable();

    let totalTime = 0;

    Object.keys(timeObj).forEach((key) => {
      const current = timeObj[key];

      if (current && typeof current === "number") {
        totalTime = current * timeTable[key];
      }
    });

    return totalTime * 1000;
  }

  static stringToMs(timeStr: string): number {
    const timeTable: TimeObjType = this.getTimeTable();
    const timeArr = timeStr.split(" ");
    let totalTime = 0;

    Object.keys(timeTable).forEach((key) => {
      timeArr.forEach((time) => {
        if (time.indexOf(key) > -1 && parseInt(time)) {
          totalTime = parseInt(time) * timeTable[key];
        }
      });
    });

    return totalTime * 1000;
  }
}

export default Lookie;
