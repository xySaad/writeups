export class Signal<T = void> {
  promise: Promise<T>;
  resolve!: (value: T) => void;
  reject!: (reason?: unknown) => void;

  constructor() {
    this.promise = Signal.makePromise<T>(this);
  }

  reset() {
    this.promise = Signal.makePromise<T>(this);
  }

  private static makePromise<T>(self: Signal<T>): Promise<T> {
    const p = new Promise<T>((resolve, reject) => {
      self.resolve = resolve;
      self.reject = reject;
    });
    return p;
  }
}
