import List from './list';

type RecordList<T> = Partial<Record<string, List<T>>>;

export default class LightEvent<T extends (...args: any[]) => void> {
  private readonly subscribers: RecordList<T>;
  private readonly cacheParams: RecordList<Parameters<T>>;

  private readonly before: boolean | string[];

  constructor(options?: { before?: boolean | string[] }) {
    this.subscribers = Object.create(null);
    this.before = options?.before ?? false;
    if (this.before) this.cacheParams = Object.create(null);
  }

  on(key: string, subscriber: T, options?: { before?: boolean }) {
    if (!this.subscribers[key]) this.subscribers[key] = new List();
    this.subscribers[key]!.add(subscriber);

    if (options?.before) {
      this.cacheParams[key]?.forEach(v => subscriber(...v));
    }
  }

  off(key: string, subscriber?: T) {
    const subscribers = this.subscribers[key];
    if (!subscribers) return;
    if (subscriber) subscribers.delete(subscriber);
    else this.subscribers[key] = this.cacheParams[key] = undefined;
  }

  emit(key: string, ...rest: Parameters<T>) {
    const subscribers = this.subscribers[key];
    if (!subscribers) return;
    subscribers.forEach(sub => sub && sub(...rest));

    if (this.canCache(key)) {
      if (!this.cacheParams[key]) this.cacheParams[key] = new List();
      this.cacheParams[key]!.add(rest);
    }
  }

  private canCache(key: string) {
    if (this.before === true) return true;
    return Array.isArray(this.before) && this.before.indexOf(key) > -1;
  }
}
