export type Logger = {
  debug: (...args: any[]) => void;
  log: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
};

/**
 * Decorator for classes which allows to enable auto logging
 */
export const loggable = <T extends { [key: string]: any }>(target: T, logger: Logger = console): T => {
  const proxyHandler = {
    get(target: T, prop: keyof T, receiver: any): any {
      if (typeof target[prop] === "function") {
        return (...args: any[]) => {
          const start = performance.now();
          logger.log(`${target.constructor.name}.${prop.toString()} started with args "${JSON.stringify(args)}"`);
          const result = target[prop].apply(target, args);

          if (result instanceof Promise) {
            return result.then((r) => {
              const end = performance.now();
              logger.log(`${target.constructor.name}.${prop.toString()} finished ${(end - start).toFixed(2)}ms`);
              return r;
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

  // @ts-ignore
  return new Proxy(target, proxyHandler);
};
