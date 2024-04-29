export type Logger = {
  debug: (...args: unknown[]) => void;
  log: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};

/**
 * Decorator for classes which allows to enable auto logging
 */
export const loggable = <T extends { [key: string]: (...args: unknown[]) => unknown }>(
  target: T,
  logger: Logger = console,
): T => {
  const proxyHandler = {
    get(target: T, prop: keyof T, receiver: unknown): unknown {
      if (typeof target[prop] === "function") {
        return (...args: unknown[]) => {
          const start = performance.now();
          logger.log(`${target.constructor.name}.${prop.toString()} started with args "${JSON.stringify(args)}"`);
          // @NOTE: we need to use .apply in that case so mute the eslint rule.
          /* eslint-disable-next-line */
          const result = target[prop].apply(target, args);

          if (result instanceof Promise) {
            return result
              .then((r) => {
                const end = performance.now();
                logger.log(`${target.constructor.name}.${prop.toString()} finished ${(end - start).toFixed(2)}ms`);
                return r;
              })
              .catch((err) => {
                logger.error(err);
                throw err;
              });
          }

          const end = performance.now();
          logger.log(`${target.constructor.name}.${prop.toString()} finished ${(end - start).toFixed(2)}ms`);
          return result;
        };
      }

      return Reflect.get(target, prop, receiver);
    },
  };

  // @ts-expect-error. We use a proxy to intercept and log all methods on the object.
  // But typescript frowns on keyof T because of the symbol.
  // So we can ignore this notification, it doesn't carry any value.
  return new Proxy(target, proxyHandler);
};
