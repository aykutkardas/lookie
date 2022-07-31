import { ExpiryTime } from "../contants";
import convertObjToMS from "./convertObjToMS";
import convertStringToMS from "./convertStringToMS";

const getExpiryTime = (expiryTime: ExpiryTime): number => {
  let expiryTimeMs = 0;

  if (expiryTime instanceof Object) {
    expiryTimeMs = convertObjToMS(expiryTime);
  } else if (typeof expiryTime === "string") {
    expiryTimeMs = convertStringToMS(expiryTime);
  } else if (typeof expiryTime === "number") {
    expiryTimeMs = expiryTime;
  }

  return expiryTimeMs;
};

export default getExpiryTime;
