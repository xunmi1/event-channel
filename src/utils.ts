// IE compatible
export const findIndex = <T = any>(arr: T[], func: (value: T, index: number) => boolean) => {
  const len = arr.length;
  let k = 0;

  while (k < len) {
    if (func.call(arr, arr[k], k)) return k;
    k++;
  }
  return -1;
}

export const isArray = Array.isArray;
