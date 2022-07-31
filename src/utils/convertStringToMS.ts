import { MS_TIME_TABLE } from "../contants";

const convertStringToMS = (timeStr: string): number => {
  const timeArr = timeStr.split(" ");
  let totalTime = 0;

  timeArr.forEach((time) => {
    const key = /[YMDhms]/g.exec(time);
    const parsedTime = parseInt(time);

    if (!key || !parsedTime) return;

    const currentTime = MS_TIME_TABLE[key[0]];

    totalTime += parseInt(time) * currentTime;
  });

  return totalTime;
};

export default convertStringToMS;
