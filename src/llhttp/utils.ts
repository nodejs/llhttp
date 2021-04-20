export interface IEnumMap {
  [key: string]: number;
}

export function enumToMap(
  obj: any,
  filter?: ReadonlyArray<number>,
  exceptions?: ReadonlyArray<number>,
): IEnumMap {
  const res: IEnumMap = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (typeof value !== 'number') {
      return;
    }
    if (filter && !filter.includes(value)) {
      return;
    }
    if (exceptions && exceptions.includes(value)) {
      return;
    }
    res[key] = value;
  });

  return res;
}
