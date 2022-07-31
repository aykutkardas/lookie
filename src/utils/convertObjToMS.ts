import { MSTimeTable, MS_TIME_TABLE } from "../contants";

const convertObjToMS = (timeObj: MSTimeTable): number => {
  let totalTime = 0;

  Object.keys(timeObj).forEach((key) => {
    const current = timeObj[key];

    if (current && typeof current === "number") {
      totalTime += current * MS_TIME_TABLE[key];
    }
  });

  return totalTime;
};

export default convertObjToMS;
