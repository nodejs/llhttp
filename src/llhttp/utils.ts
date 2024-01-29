type NumericKeys<T> = {
  [K in keyof T]: T[K] extends number ? K : never
}[keyof T];

export type IEnumMap<T = Record<string, any>> = {
  [K in NumericKeys<T>]: T[K]
};

export function enumToMap<T extends Record<string, any>>(
  obj: T,
  filter?: ReadonlyArray<number>,
  exceptions?: ReadonlyArray<number>,
): IEnumMap<T> {
  const res: Record<string, number> = {};

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (typeof value !== 'number') {
      continue;
    }
    if (filter && !filter.includes(value)) {
      continue;
    }
    if (exceptions && exceptions.includes(value)) {
      continue;
    }
    res[key] = value;
  }

  return res as IEnumMap<T>;
}
