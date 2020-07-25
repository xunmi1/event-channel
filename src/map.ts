class CustomMap<T = any, U = any> {
  private readonly _data = Object.create(null);

  delete(key: T) {
    this._data[key] = undefined;
  }

  get(key: T): U | undefined {
    return this._data[key];
  }

  has(key: T): boolean {
    return this._data[key] !== undefined;
  }

  set(key: T, value: U) {
    this._data[key] = value;
  }
}

export type { CustomMap };

export const createMap = <T = any, U = any>() => {
  // if support `Symbol`, definitely support `Map`.
  // use `Map` to save `Symbol`
  const isSupport = typeof Map !== 'undefined';
  if (isSupport) return (new Map<T, U>() as unknown) as CustomMap<T, U>;
  // not support `Symbol`
  else return new CustomMap<T, U>();
};
