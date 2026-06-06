import { BAEX } from './baex';

export function Component(tagName: string) {
  return function (constructor: Function) {
    BAEX.register(tagName, constructor as any);
  };
}

export function State(target: any, propertyKey: string) {
  BAEX.log('DECORATOR_STATE', { propertyKey });
}

export function WasmMethod(methodName: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      BAEX.log('WASM_METHOD_INVOKE', { methodName, args });
      return BAEX.callBridge(methodName, ...args);
    };
    return descriptor;
  };
}
