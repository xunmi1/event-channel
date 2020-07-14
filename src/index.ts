import { version } from '../package.json';
import { findIndex, isArray } from './utils';

type RecordList<T> = Partial<Record<string, T[]>>;

/** @public */
export default class EventChannel<T extends (...args: any[]) => void> {
  static readonly version = version;
  private readonly subscribers: RecordList<[T, any]>;
  private readonly historyParams: RecordList<Parameters<T>>;

  private readonly before: boolean | string[];

  /**
   * @param [options.before] - cache previous (offline) events
   */
  constructor(options?: { before?: boolean | string[] }) {
    this.subscribers = Object.create(null);
    this.historyParams = Object.create(null);

    this.before = options?.before ?? false;
  }

  private canCache(key: string) {
    if (this.before === true) return true;
    return isArray(this.before) && this.before.indexOf(key) > -1;
  }

  private invokeSubscriber(subscriber: T, context: any, params: Parameters<T>) {
    return subscriber.apply(context, params);
  }

  /**
   * subscribe to an event
   * @param key - event name
   * @param subscriber
   * @param options
   * @param [options.before] - whether to subscribe to previous events.
   * The premise is to use `new EventChannel({ before: true | [key] })`
   * @param [options.context] - context of subscriber
   */
  on(key: string, subscriber: T, options?: { before?: boolean; context?: any }) {
    const { before, context } = options ?? {};
    if (!this.subscribers[key]) this.subscribers[key] = [];
    this.subscribers[key]!.push([subscriber, context]);

    if (before) {
      this.historyParams[key]?.forEach(v => this.invokeSubscriber(subscriber, context, v));
    }
  }

  /**
   * Subscribe to a one-time event
   * @param key - event name
   * @param subscriber
   * @param options
   * @param [options.before] - whether to subscribe to previous events.
   * The premise is to use `new EventChannel({ before: true | [key] })`
   * @param [options.context] - context of subscriber
   */
  once(key: string, subscriber: T, options?: { before?: boolean; context?: any }) {
    const { context } = options ?? {};
    const wrapper = (...args: Parameters<T>) => {
      this.off(key, wrapper as T);
      return subscriber.apply(context, args);
    };

    this.on(key, wrapper as T, options);
  }

  /**
   * Unsubscribe the event
   * @param key - event name
   * @param subscriber
   */
  off(key: string, subscriber?: T) {
    const subscribers = this.subscribers[key];
    if (!subscribers) return;

    if (subscriber) {
      const index = findIndex(subscribers, v => v[0] === subscriber);
      subscribers.splice(index, 1);
    } else {
      this.subscribers[key] = undefined;
    }
  }

  /**
   * Dispatch an event
   * @param key - event name
   * @param params - event parameters
   */
  emit(key: string, ...params: Parameters<T>) {
    if (this.canCache(key)) {
      if (!this.historyParams[key]) this.historyParams[key] = [];
      this.historyParams[key]!.push(params);
    }

    const subscribers = this.subscribers[key];
    if (subscribers) {
      subscribers.forEach(([sub, ctx]) => this.invokeSubscriber(sub, ctx, params));
    }
  }
}
