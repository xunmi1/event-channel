// IE compatible
export const findIndex = <T = any>(arr: T[], func: (value: T, index: number) => boolean) => {
  if (typeof arr.findIndex === 'function') return arr.findIndex(func);

  let k = 0;
  while (k < arr.length) {
    if (func.call(arr, arr[k], k)) return k;
    k++;
  }
  return -1;
};

export const isArray = Array.isArray;
