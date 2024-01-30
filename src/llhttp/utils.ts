import { Enum } from './constants';

export function enumToMap(
  obj: Enum,
  filter: ReadonlyArray<number> = [],
  exceptions: ReadonlyArray<number> = [],
): Enum {
  const emptyFilter = (filter?.length ?? 0) === 0;
  const emptyExceptions = (exceptions?.length ?? 0) === 0;

  return Object.fromEntries(Object.entries(obj).filter(([ , value ]) => {
    return (
      typeof value === 'number' &&
      (emptyFilter || filter.includes(value)) &&
      (emptyExceptions || !exceptions.includes(value))
    );
  }));
}
