import { Data, ExpiryTime } from "./contants";

import getExpiryTime from "./utils/getExpiryTime";

class Lookie {
  public set(key: string, value: any, expiryTime?: ExpiryTime) {
    if (!key || typeof value === "undefined") return;

    let expiryTimeMs = getExpiryTime(expiryTime);

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
