/**
 * 事件、数据通信对象
 */
const Event = (function () {
  // 事件, 离线事件参数列表，数据
  const [clientList, offlineList] = [{}, {}];
  /**
   * 绑定监听事件
   * @param {string} key 监听事件
   * @param {Function} fn 监听函数
   * @param {Object} context 函数执行上下文
   * @param {boolean} old 是否监听以前消息 默认: true
   */
  const on = function (key: string, fn: any, context: any, old = true) {
    if (!clientList[key]) {
      clientList[key] = [];
    }

    clientList[key].push([fn, context, old]);
    offlineTrigger(key);
  };

  const offlineTrigger = function (key: string) {
    const listener = clientList[key][clientList[key].length - 1];
    if (listener[2] && Array.isArray(offlineList[key])) {
      // @ts-ignore
      offlineList[key].forEach((params: any) => listener[0].apply(listener[1] || this, params))
    }
  };

  const setOfflineList = function (key: string, params: IArguments) {
    if (!offlineList[key]) {
      offlineList[key] = [];
    }
    // params: 消息参数
    offlineList[key].push(params);
  };

  const trigger = function () {
    const key = Array.prototype.shift.call(arguments);
    const listeners = clientList[key];
    setOfflineList(key, arguments);
    if (!Array.isArray(listeners)) {
      return false;
    }
    // @ts-ignore
    listeners.forEach(listener => listener[0].apply(listener[1] || this, arguments));
  };

  const off = function (key: string, listener: any) {
    const listeners = clientList[key];
    if (!Array.isArray(listeners)) {
      return false;
    }
    if (!listener) {
      listeners.length = 0;
    } else {
      for (let i = listeners.length - 1; i >= 0; i--) {
        if (listeners[i][0] === listener) {
          listeners.splice(i, 1);
        }
      }
    }
  };

  return {
    on,
    trigger,
    off,
  }
})();

export default Event;
