# event-channel

[![ci](https://img.shields.io/github/workflow/status/xunmi1/event-channel/CI?style=flat-square&logo=github)](https://github.com/xunmi1/event-channel/actions?query=workflow%3ACI)
[![codecov](https://img.shields.io/codecov/c/github/xunmi1/event-channel?style=flat-square&logo=codecov)](https://codecov.io/gh/xunmi1/event-channel)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@xunmi/event-channel?style=flat-square)](https://www.npmjs.com/package/@xunmi/event-channel)
[![npm version](https://img.shields.io/npm/v/@xunmi/event-channel?&style=flat-square&logo=npm)](https://www.npmjs.com/package/@xunmi/event-channel)

Implementation of the pub-sub pattern.

### Install

- NPM
  
  ```bash
  npm install --save @xunmi/event-channel
  # or
  yarn add @xunmi/event-channel
  ```
  ```js
  import EventChannel from '@xunmi/event-channel';
  ```
  
- CDN
  
  ```html
  <script src="https://cdn.jsdelivr.net/npm/@xunmi/event-channel@1/dist/event-channel.umd.min.js"></script>
  ```

### Basic Usage

- Get instance

  ```js
  const eventChannel = new EventChannel();
  ```

- Subscribe to an event

  ```js
  const subscriber = (...params) => {
  	// do something 
  }
  // support `string` or `symbol` type
  eventChannel.on('foo', subscriber);
  ```

- Subscribe to a one-time event

  ```js
  eventChannel.once('foo', subscriber);
	```

- Dispatch an event

  ```js
  eventChannel.emit('foo', ...params);
  ```

- Unsubscribe to an event

  ```js
  eventChannel.off('foo', subscriber);
  
  // unsubscribe all about 'foo'
  eventChannel.off('foo');
  ```

### Other Usage

- Binding context

  ```js
  eventChannel.on('foo', subscriber, { context: this });
  ```

- Publish before subscribe

  ```js
  // set `before` is event type or `true`
  const eventChannel = new EventChannel({ before: ['foo'] });
  
  // set `before` is `true`
  eventChannel.on('foo', subscriber, { before: true });
  ```
