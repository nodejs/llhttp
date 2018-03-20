export interface IEnumMap {
  [key: string]: number;
}

export function enumToMap(obj: any): IEnumMap {
  const res: IEnumMap = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (typeof value === 'number') {
      res[key] = value;
    }
  });

  return res;
}
