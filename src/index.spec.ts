import { expect } from "chai";
import "mocha";

const localStorage = require("localStorage");
global.localStorage = localStorage;

import lookie from "./index";

describe("Lookie Methods Tests", () => {
  it("Set", () => {
    lookie.set("caseSet", true);
    expect(true).to.equal(JSON.parse(localStorage.getItem("caseSet")).value);
  });

  it("Set All", () => {
    lookie.setAll({ caseOne: "test1", caseTwo: "test2" });
    expect("test1").to.equal(JSON.parse(localStorage.getItem("caseOne")).value);
    expect("test2").to.equal(JSON.parse(localStorage.getItem("caseTwo")).value);
  });

  it("Get", () => {
    expect(true).to.equal(lookie.get("caseSet"));
  });

  it("Get with Data[set with localStorage]", () => {
    localStorage.setItem("caseNormalSet", "enable");
    expect("enable").to.equal(lookie.get("caseNormalSet"));
  });

  it("Get with Data[string]", () => {
    lookie.set("caseStringData", "test");
    expect("test").to.equal(lookie.get("caseStringData"));
  });

  it("Get with Data[number]", () => {
    lookie.set("caseNumberData", 10);
    expect(10).to.equal(lookie.get("caseNumberData"));
  });

  it("Get with Data[boolean]", () => {
    lookie.set("caseBooleanData", false);
    expect(false).to.equal(lookie.get("caseBooleanData"));
  });

  it("Get with Data[array]", () => {
    lookie.set("caseArrayData", [1, 2, 3]);
    expect([1, 2, 3]).to.deep.equal(lookie.get("caseArrayData"));
  });

  it("Get with Data[object]", () => {
    lookie.set("caseArrayData", { a: 1, b: 2, c: 3 });
    expect({ a: 1, b: 2, c: 3 }).to.deep.equal(lookie.get("caseArrayData"));
  });

  it("Remove", () => {
    lookie.remove("caseSet");
    expect(null).to.equal(lookie.get("caseSet"));
  });

  it("Set with Expiry[number]", () => {
    lookie.set("caseSetWithExpiryNumberType", true, 100); // 100ms
    expect(true).to.equal(lookie.get("caseSetWithExpiryNumberType"));
    setTimeout(() => {
      expect(null).to.equal(lookie.get("caseSetWithExpiryNumberType"));
    }, 200);
  });

  it("Set with Expiry[string]", () => {
    lookie.set("caseSetWithExpiryStringType", true, "1s"); // 1 seconds
    expect(true).to.equal(lookie.get("caseSetWithExpiryStringType"));
    setTimeout(() => {
      expect(null).to.equal(lookie.get("caseSetWithExpiryStringType"));
    }, 1100);
  });

  it("Set with Expiry[object]", () => {
    lookie.set("caseSetWithExpiryObjectType", true, { s: 1 }); // 1 seconds
    expect(true).to.equal(lookie.get("caseSetWithExpiryObjectType"));
    setTimeout(() => {
      expect(null).to.equal(lookie.get("caseSetWithExpiryObjectType"));
    }, 1100);
  });

  it("SetAll with Expiry[number]", () => {
    lookie.setAll({ caseOne: "test1", caseTwo: "test2" }, 100); // 100ms
    expect("test1").to.equal(lookie.get("caseOne"));
    expect("test2").to.equal(lookie.get("caseTwo"));

    setTimeout(() => {
      expect(null).to.equal(lookie.get("caseOne"));
      expect(null).to.equal(lookie.get("caseTwo"));
    }, 200);
  });

  it("Sync", () => {
    lookie.set("caseSync", true, 100); // 100ms
    expect(true).to.equal(lookie.get("caseSync"));
    setTimeout(() => {
      lookie.sync();

      expect(null).to.equal(localStorage.getItem("caseSync"));
    }, 200);
  });
});
