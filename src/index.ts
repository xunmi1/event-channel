import { version } from '../package.json';
import { createMap, CustomMap } from './map';
import { findIndex, isArray } from './utils';

export type EventType = string | symbol;
export type Subscriber = (...args: any[]) => void;
type RecordMap<T> = CustomMap<EventType, T[]>;

/** @public */
export default class EventChannel<T extends Subscriber> {
  static readonly version = version;
  private readonly subscribers: RecordMap<[T, unknown]>;
  private readonly historyParams: RecordMap<Parameters<T>>;

  private readonly before: boolean | EventType[];

  /**
   * @param [options.before] - cache previous (offline) events
   */
  constructor(options?: { before?: boolean | EventType[] }) {
    this.subscribers = createMap();
    this.historyParams = createMap();

    this.before = options?.before ?? false;
  }

  private canCache(key: EventType) {
    if (this.before === true) return true;
    return isArray(this.before) && this.before.indexOf(key) > -1;
  }

  private invokeSub(subscriber: T, context: any, params: Parameters<T>) {
    return subscriber.apply(context, params);
  }

  private addSub(key: EventType, subscriber: T, context: any) {
    if (!this.subscribers.has(key)) this.subscribers.set(key, []);

    const list = this.subscribers.get(key);
    // deduplication
    const index = findIndex((list as unknown) as T[], v => v[0] === subscriber && v[1] === context);
    if (index < 0) list!.push([subscriber, context]);
    else list!.splice(index, 1, [subscriber, context]);
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
  on(key: EventType, subscriber: T, options?: { before?: boolean; context?: any; once?: boolean }) {
    const { before, context } = options ?? {};
    this.addSub(key, subscriber, context);

    if (before) {
      this.historyParams.get(key)?.forEach((v: Parameters<T>) => this.invokeSub(subscriber, context, v));
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
  once(key: EventType, subscriber: T, options?: { before?: boolean; context?: any }) {
    const { before, context } = options ?? {};
    if (before) {
      const history = this.historyParams.get(key);
      if (isArray(history) && history.length) {
        this.invokeSub(subscriber, context, history[0]);
        return;
      }
    }
    const wrapper = (...args: Parameters<T>) => {
      this.off(key, wrapper as T);
      return this.invokeSub(subscriber, context, args);
    };
    this.addSub(key, wrapper as T, context);
  }

  /**
   * Unsubscribe to an event
   * @param key - event name
   * @param subscriber
   */
  off(key: EventType, subscriber?: T) {
    const subscribers = this.subscribers.get(key);
    if (!subscribers) return;

    if (subscriber) {
      const index = findIndex(subscribers, v => v[0] === subscriber);
      subscribers.splice(index, 1);
    } else {
      this.subscribers.delete(key);
    }
  }

  /**
   * Dispatch an event
   * @param key - event name
   * @param params - event parameters
   */
  emit(key: EventType, ...params: Parameters<T>) {
    if (this.canCache(key)) {
      if (!this.historyParams.has(key)) this.historyParams.set(key, []);
      this.historyParams.get(key)!.push(params);
    }

    this.subscribers.get(key)?.forEach(([sub, ctx]) => this.invokeSub(sub, ctx, params));
  }
}
