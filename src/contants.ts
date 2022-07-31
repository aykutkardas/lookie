export type ExpiryTime = number | string | MSTimeTable;

export type Data = { value: any; expiry?: number };

export type MSTimeTable = {
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
