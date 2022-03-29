type MSTimeTable = {
  Y?: number;
  M?: number;
  D?: number;
  h?: number;
  m?: number;
  s?: number;
};

export const MS_TIME_TABLE: MSTimeTable = {
  Y: 31556926000,
  M: 2629743830,
  D: 86400000,
  h: 3600000,
  m: 60000,
  s: 1000,
};

type ExpiryTime = number | string | MSTimeTable;

type Data = { value: any; expiry?: number };

class Lookie {
  private convertObjToMS(timeObj: MSTimeTable): number {
    let totalTime = 0;

    Object.keys(timeObj).forEach((key) => {
      const current = timeObj[key];

      if (current && typeof current === "number") {
        totalTime = current * MS_TIME_TABLE[key];
      }
    });

    return totalTime;
  }

  private convertStringToMS(timeStr: string): number {
    const timeArr = timeStr.split(" ");
    let totalTime = 0;

    timeArr.forEach((time) => {
      const key = /[YMDhms]/g.exec(time);
      const parsedTime = parseInt(time);

      if (!key || !parsedTime) return;

      const currentTime = MS_TIME_TABLE[key[0]];

      totalTime = parseInt(time) * currentTime;
    });

    return totalTime;
  }

  private getExpiryTime(expiryTime: ExpiryTime): number {
    let expiryTimeMs = 0;

    if (expiryTime instanceof Object) {
      expiryTimeMs = this.convertObjToMS(expiryTime);
    } else if (typeof expiryTime === "string") {
      expiryTimeMs = this.convertStringToMS(expiryTime);
    } else if (typeof expiryTime === "number") {
      expiryTimeMs = expiryTime;
    }

    return expiryTimeMs;
  }

  public set(key: string, value: any, expiryTime?: ExpiryTime) {
    if (!key || typeof value === "undefined") return;

    let expiryTimeMs = this.getExpiryTime(expiryTime);

    const now = new Date().getTime();
    const expiry = now + expiryTimeMs;

    const data: Data = { value };

    if (expiryTimeMs) data.expiry = expiry;

    localStorage.setItem(key, JSON.stringify(data));
  }

  public setAll(obj: Object, expiryTime?: ExpiryTime) {
    if (typeof obj !== "object") return;

    Object.entries(obj).forEach(([key, value]) =>
      this.set(key, value, expiryTime)
    );
  }

  public get(key: string): any {
    const dataStr = localStorage.getItem(key);

    if (!dataStr) return null;

    try {
      const item = JSON.parse(dataStr);
      const now = new Date().getTime();

      if (item.expiry && now > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }

      return item.value;
    } catch (err) {
      return dataStr;
    }
  }

  public remove(key: string) {
    localStorage.removeItem(key);
  }

  public sync() {
    Object.keys(localStorage).forEach(this.get);
  }
}

export default new Lookie();
