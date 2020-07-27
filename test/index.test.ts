import EventChannel from '../src';

describe('create', () => {
  test('created instance', () => {
    expect(new EventChannel()).toStrictEqual(expect.any(EventChannel));
  });
});

describe('dispatch', () => {
  test('basic', () => {
    const [event, key, fn] = [new EventChannel(), Symbol(), jest.fn()];

    event.on(key, fn);
    event.emit(key, 1);
    event.emit(key, 1, 2);

    // The mock function is called twice
    expect(fn.mock.calls.length).toBe(2);
    // The argument of the first call
    expect(fn.mock.calls[0]).toEqual([1]);
    // The argument of the second call
    expect(fn.mock.calls[1]).toEqual([1, 2]);
  });

  test('before event', () => {
    const [event, key, fn] = [new EventChannel({ before: true }), Symbol(), jest.fn()];

    event.emit(key, 1);
    event.on(key, fn, { before: true });
    event.emit(key, 2);

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[0][0]).toEqual(1);
    expect(fn.mock.calls[1][0]).toEqual(2);
  });

  test('limited event scope about before', () => {
    const [key, key1] = [Symbol(), Symbol()];
    // Only save `key`
    const event = new EventChannel({ before: [key] });
    const fn = jest.fn();

    event.emit(key, 1);
    event.emit(key1, 2);
    event.on(key, fn, { before: true });
    event.on(key1, fn, { before: true });

    expect(fn.mock.calls.length).toBe(1);
    expect(fn.mock.calls[0][0]).toBe(1);
  });

  test('context', () => {
    const [event, key, fn] = [new EventChannel(), Symbol(), jest.fn()];
    const context = {};
    event.on(key, fn, { context });
    event.emit(key);

    expect(fn.mock.instances[0]).toBe(context);
  });

  test('same events', () => {
    const [event, key, fn] = [new EventChannel(), Symbol(), jest.fn()];
    event.on(key, fn);
    // Should replace the previous fn
    event.on(key, fn);
    // Different context
    event.on(key, fn, { context: {} });
    event.emit(key);

    expect(fn.mock.calls.length).toBe(2);
  });
});

// once
describe('dispatch once', () => {
  test('basic', () => {
    const [event, key, fn] = [new EventChannel(), Symbol(), jest.fn()];

    event.once(key, fn);
    event.emit(key);
    event.emit(key);

    expect(fn.mock.calls.length).toBe(1);
  });

  test('before and context', () => {
    const [event, key, fn] = [new EventChannel({ before: true }), Symbol(), jest.fn()];
    const context = {};
    // subscribe first
    event.once(key, fn, { before: true, context });
    event.emit(key);
    event.emit(key);
    expect(fn.mock.calls.length).toBe(1);
    expect(fn.mock.instances[0]).toBe(context);

    // dispatch first
    event.emit(key);
    event.emit(key);
    event.once(key, fn, { before: true, context });
    expect(fn.mock.calls.length).toBe(2);
  });
});

describe('unsubscribe', () => {
  test('basic', () => {
    const [event, key, fn] = [new EventChannel(), Symbol(), jest.fn()];

    event.on(key, fn);
    event.emit(key);
    event.off(key, fn);
    event.emit(key);

    expect(fn.mock.calls.length).toBe(1);
  });

  test('unsubscribe all', () => {
    const [event, key] = [new EventChannel(), Symbol()];
    const [fn, fn1] = [jest.fn(), jest.fn()];

    event.on(key, fn);
    event.on(key, fn1);
    event.emit(key);
    event.off(key);
    event.emit(key);

    expect(fn.mock.calls.length).toBe(1);
    expect(fn1.mock.calls.length).toBe(1);
  });

  test('unsubscribe to undefined event', () => {
    const event = new EventChannel();
    expect(() => event.off(Symbol())).not.toThrowError();
  });
});
