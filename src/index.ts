type MSTimeTable = {
  Y?: number;
  M?: number;
  D?: number;
  h?: number;
  m?: number;
  s?: number;
};

export type TimeUnit = keyof MSTimeTable | "ms";

export type TimeObject = MSTimeTable & { ms?: number };

export type ExpiryTime = number | string | TimeObject | Date;

export const MS_TIME_TABLE: MSTimeTable = {
  Y: 31556926000,
  M: 2629743830,
  D: 86400000,
  h: 3600000,
  m: 60000,
  s: 1000,
};

const UNIT_MS: Record<TimeUnit, number> = {
  Y: 31556926000,
  M: 2629743830,
  D: 86400000,
  h: 3600000,
  m: 60000,
  s: 1000,
  ms: 1,
};

// "1M 15D 20h", "1h30m", "1.5h", "500ms"
const DURATION_TOKEN = /(\d+(?:\.\d+)?)\s*(ms|[YMDhms])/g;
const DURATION_STRING = /^\s*(?:\d+(?:\.\d+)?\s*(?:ms|[YMDhms])\s*)+$/;

type Data = { value: any; expiry?: number };

function warn(message: string) {
  if (typeof console !== "undefined" && console.warn) {
    console.warn(`[lookie] ${message}`);
  }
}

function isUnit(key: string): key is TimeUnit {
  return Object.prototype.hasOwnProperty.call(UNIT_MS, key);
}

// Only records written by lookie ({ value } or { value, expiry }) are unwrapped,
// so data stored by other code is never misread or deleted.
function isLookieData(item: unknown): item is Data {
  if (!item || typeof item !== "object" || Array.isArray(item)) return false;

  const keys = Object.keys(item);

  if (keys.indexOf("value") === -1) return false;
  if (!keys.every((key) => key === "value" || key === "expiry")) return false;

  const expiry = (item as Data).expiry;

  return typeof expiry === "undefined" || typeof expiry === "number";
}

class Lookie {
  private getStorage(): Storage | null {
    try {
      if (typeof localStorage === "undefined" || !localStorage) return null;
      return localStorage;
    } catch (err) {
      // Accessing localStorage throws when storage is disabled (e.g. SecurityError).
      return null;
    }
  }

  private convertObjToMS(timeObj: TimeObject): number | null {
    let totalTime = 0;
    let valid = true;

    Object.keys(timeObj).forEach((key) => {
      const current = (timeObj as Record<string, unknown>)[key];

      if (!isUnit(key)) {
        warn(`Unknown time unit "${key}" in expiry object, ignored.`);
        return;
      }

      if (typeof current !== "number" || !isFinite(current)) {
        valid = false;
        return;
      }

      totalTime += current * UNIT_MS[key];
    });

    return valid ? totalTime : null;
  }

  private convertStringToMS(timeStr: string): number | null {
    if (!DURATION_STRING.test(timeStr)) return null;

    let totalTime = 0;
    let match: RegExpExecArray | null;

    DURATION_TOKEN.lastIndex = 0;

    while ((match = DURATION_TOKEN.exec(timeStr))) {
      totalTime += parseFloat(match[1]) * UNIT_MS[match[2] as TimeUnit];
    }

    return totalTime;
  }

  // Returns the absolute expiry timestamp, or undefined for "no expiry".
  private getExpiry(expiryTime: ExpiryTime | undefined, now: number): number | undefined {
    if (typeof expiryTime === "undefined" || expiryTime === null) return;

    if (expiryTime instanceof Date) {
      const time = expiryTime.getTime();

      if (isNaN(time)) {
        warn("Invalid Date given as expiry, data is stored without expiry.");
        return;
      }

      return time;
    }

    let expiryTimeMs: number | null = null;

    if (typeof expiryTime === "number") {
      expiryTimeMs = isFinite(expiryTime) ? expiryTime : null;
    } else if (typeof expiryTime === "string") {
      expiryTimeMs = this.convertStringToMS(expiryTime);
    } else if (typeof expiryTime === "object") {
      expiryTimeMs = this.convertObjToMS(expiryTime);
    }

    if (expiryTimeMs === null) {
      warn(
        `Invalid expiry ${JSON.stringify(expiryTime)}, data is stored without expiry. ` +
          `Use units Y, M, D, h, m, s, ms (e.g. "1D 12h").`
      );
      return;
    }

    if (!expiryTimeMs) return;

    return now + expiryTimeMs;
  }

  public set<T = any>(key: string, value: T, expiryTime?: ExpiryTime): boolean {
    if (!key || typeof value === "undefined") return false;

    const storage = this.getStorage();

    if (!storage) return false;

    const data: Data = { value };
    const expiry = this.getExpiry(expiryTime, Date.now());

    if (typeof expiry !== "undefined") data.expiry = expiry;

    const dataStr = JSON.stringify(data);

    try {
      storage.setItem(key, dataStr);
      return true;
    } catch (err) {
      // QuotaExceededError, or storage unavailable in private mode.
      return false;
    }
  }

  public setAll(obj: object, expiryTime?: ExpiryTime): boolean {
    if (!obj || typeof obj !== "object") return false;

    let success = true;

    Object.keys(obj).forEach((key) => {
      const value = (obj as Record<string, unknown>)[key];

      if (!this.set(key, value, expiryTime)) success = false;
    });

    return success;
  }

  public get<T = any>(key: string): T | null {
    const storage = this.getStorage();

    if (!storage) return null;

    let dataStr: string | null;

    try {
      dataStr = storage.getItem(key);
    } catch (err) {
      return null;
    }

    if (!dataStr) return null;

    let item: unknown;

    try {
      item = JSON.parse(dataStr);
    } catch (err) {
      return dataStr as unknown as T;
    }

    // Not written by lookie: return the raw string like localStorage does.
    if (!isLookieData(item)) return dataStr as unknown as T;

    if (typeof item.expiry === "number" && Date.now() > item.expiry) {
      this.remove(key);
      return null;
    }

    return item.value;
  }

  public remove(key: string) {
    const storage = this.getStorage();

    if (!storage) return;

    try {
      storage.removeItem(key);
    } catch (err) {}
  }

  public sync() {
    const storage = this.getStorage();

    if (!storage) return;

    const keys: string[] = [];

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);

      if (key !== null) keys.push(key);
    }

    keys.forEach((key) => this.get(key));
  }
}

export default new Lookie();
