import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import lookie from "./index.ts";

class MemoryStorage {
  private data = new Map<string, string>();
  quotaExceeded = false;

  get length() {
    return this.data.size;
  }
  key(i: number) {
    return Array.from(this.data.keys())[i] ?? null;
  }
  getItem(key: string) {
    return this.data.has(key) ? (this.data.get(key) as string) : null;
  }
  setItem(key: string, value: string) {
    if (this.quotaExceeded) throw new Error("QuotaExceededError");
    this.data.set(key, String(value));
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  clear() {
    this.data.clear();
  }
}

const g = global as any;

let storage: MemoryStorage;
g.localStorage = storage = new MemoryStorage();

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const realNow = Date.now;
const realWarn = console.warn;
let now = 1_000_000_000_000;
let warnings: string[] = [];

const advance = (ms: number) => {
  now += ms;
};

const expiryOf = (key: string) => JSON.parse(storage.getItem(key) as string).expiry;

beforeEach(() => {
  g.localStorage = storage = new MemoryStorage();
  Date.now = () => now;
  warnings = [];
  console.warn = (msg: string) => warnings.push(msg);
});

afterEach(() => {
  Date.now = realNow;
  console.warn = realWarn;
});

describe("set / get", () => {
  it("stores and returns values of JSON types", () => {
    const cases: Array<[string, unknown]> = [
      ["string", "test"],
      ["empty", ""],
      ["number", 10],
      ["zero", 0],
      ["boolean", false],
      ["null", null],
      ["array", [1, 2, 3]],
      ["object", { a: 1, b: 2, c: 3 }],
    ];

    cases.forEach(([key, value]) => {
      assert.equal(lookie.set(key, value), true);
      assert.deepEqual(lookie.get(key), value);
    });
  });

  it("stores data in { value } format", () => {
    lookie.set("caseSet", true);
    assert.deepEqual(JSON.parse(storage.getItem("caseSet") as string), { value: true });
  });

  it("ignores empty key and undefined value", () => {
    assert.equal(lookie.set("", 1), false);
    assert.equal(lookie.set("undef", undefined), false);
    assert.equal(storage.length, 0);
  });

  it("returns null for missing keys", () => {
    assert.equal(lookie.get("missing"), null);
  });

  it("setAll stores every key", () => {
    assert.equal(lookie.setAll({ caseOne: "test1", caseTwo: "test2" }), true);
    assert.equal(lookie.get("caseOne"), "test1");
    assert.equal(lookie.get("caseTwo"), "test2");
  });

  it("remove deletes the key", () => {
    lookie.set("caseRemove", true);
    lookie.remove("caseRemove");
    assert.equal(lookie.get("caseRemove"), null);
  });
});

describe("data not written by lookie", () => {
  it("returns raw strings as they are", () => {
    const raws = ["enable", "5", "true", "null", "[1,2]", '{"a":1}', '"str"'];

    raws.forEach((raw) => {
      storage.setItem("raw", raw);
      assert.equal(lookie.get("raw"), raw);
    });
  });

  it("does not treat foreign objects with an expiry field as lookie data", () => {
    const foreign = '{"value":"x","expiry":1,"owner":"other-lib"}';
    storage.setItem("foreign", foreign);

    assert.equal(lookie.get("foreign"), foreign);
    assert.equal(storage.getItem("foreign"), foreign);
  });
});

describe("expiry", () => {
  it("expires number (ms) expiry", () => {
    lookie.set("n", true, 100);
    assert.equal(lookie.get("n"), true);
    advance(101);
    assert.equal(lookie.get("n"), null);
    assert.equal(storage.getItem("n"), null);
  });

  it("expires string expiry", () => {
    lookie.set("s", true, "1s");
    advance(SECOND);
    assert.equal(lookie.get("s"), true);
    advance(1);
    assert.equal(lookie.get("s"), null);
  });

  it("expires object expiry", () => {
    lookie.set("o", true, { s: 1 });
    advance(SECOND + 1);
    assert.equal(lookie.get("o"), null);
  });

  it("expires setAll with expiry", () => {
    lookie.setAll({ caseOne: "test1", caseTwo: "test2" }, 100);
    assert.equal(lookie.get("caseOne"), "test1");
    advance(101);
    assert.equal(lookie.get("caseOne"), null);
    assert.equal(lookie.get("caseTwo"), null);
  });

  it("supports Date as absolute expiry", () => {
    lookie.set("date", true, new Date(now + MINUTE));
    assert.equal(expiryOf("date"), now + MINUTE);
  });

  it("stores without expiry when expiry is 0 or omitted", () => {
    lookie.set("zero", true, 0);
    lookie.set("none", true);
    assert.equal(expiryOf("zero"), undefined);
    assert.equal(expiryOf("none"), undefined);
    assert.equal(warnings.length, 0);
  });

  describe("string parsing", () => {
    const valid: Array<[string, number]> = [
      ["1s", SECOND],
      ["10ms", 10],
      ["1.5h", 1.5 * HOUR],
      ["2D", 2 * DAY],
      ["1 h", HOUR],
      ["1h30m", HOUR + 30 * MINUTE],
      ["1M 15D 20h", 2629743830 + 15 * DAY + 20 * HOUR],
      ["1Y", 31556926000],
    ];

    valid.forEach(([input, ms]) => {
      it(`parses "${input}"`, () => {
        lookie.set("k", true, input);
        assert.equal(expiryOf("k"), now + ms);
        assert.equal(warnings.length, 0);
      });
    });

    ["2days", "1d", "1w", "1y", "1H", "abc", "h", "1h foo"].forEach((input) => {
      it(`rejects "${input}" with a warning`, () => {
        lookie.set("k", true, input);
        assert.equal(expiryOf("k"), undefined);
        assert.equal(warnings.length, 1);
      });
    });
  });

  describe("object parsing", () => {
    it("sums known units", () => {
      lookie.set("k", true, { D: 1, h: 2, ms: 5 });
      assert.equal(expiryOf("k"), now + DAY + 2 * HOUR + 5);
    });

    it("ignores unknown units with a warning", () => {
      lookie.set("k", true, { D: 1, x: 1 } as any);
      assert.equal(expiryOf("k"), now + DAY);
      assert.equal(warnings.length, 1);
    });

    it("rejects non-numeric values with a warning", () => {
      lookie.set("k", true, { s: "1" } as any);
      assert.equal(expiryOf("k"), undefined);
      assert.equal(warnings.length, 1);
    });
  });

  it("rejects invalid Date and NaN with a warning", () => {
    lookie.set("a", true, new Date("invalid"));
    lookie.set("b", true, NaN);
    assert.equal(expiryOf("a"), undefined);
    assert.equal(expiryOf("b"), undefined);
    assert.equal(warnings.length, 2);
  });
});

describe("sync", () => {
  it("removes only expired lookie data", () => {
    const foreign = '{"value":"x","expiry":1,"owner":"other-lib"}';

    lookie.set("expired", true, 100);
    lookie.set("alive", true, HOUR);
    lookie.set("forever", true);
    storage.setItem("foreign", foreign);
    storage.setItem("plain", "enable");

    advance(101);
    lookie.sync();

    assert.equal(storage.getItem("expired"), null);
    assert.equal(lookie.get("alive"), true);
    assert.equal(lookie.get("forever"), true);
    assert.equal(storage.getItem("foreign"), foreign);
    assert.equal(storage.getItem("plain"), "enable");
  });
});

describe("unavailable storage", () => {
  it("does not throw when localStorage is not defined (SSR)", () => {
    delete g.localStorage;

    assert.equal(lookie.set("k", 1), false);
    assert.equal(lookie.setAll({ k: 1 }), false);
    assert.equal(lookie.get("k"), null);
    assert.doesNotThrow(() => lookie.remove("k"));
    assert.doesNotThrow(() => lookie.sync());
  });

  it("returns false when quota is exceeded", () => {
    storage.quotaExceeded = true;
    assert.equal(lookie.set("k", 1), false);
  });
});
