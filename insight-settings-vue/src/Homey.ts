type Callback<T> = (error: unknown, result: T) => void;

export interface HomeyAPI {
  __(key: string, tokens?: object): string;
  ready(): void;
  alert(message: string): void;
  get(key: string, callback: Callback<unknown>): void;
  set(key: string, value: unknown, callback: Callback<unknown>): void;
  api(method: string, path: string, body: unknown, callback: Callback<unknown>): void;
}

function call<T>(fn: (callback: Callback<unknown>) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    fn((error, result) => (error ? reject(error) : resolve(result as T)));
  });
}

const Homey = {
  __(key: string, tokens?: object): string {
    return window.Homey?.__(key, tokens) ?? key;
  },
  get<T>(key: string): Promise<T | undefined> {
    return call((callback) => window.Homey.get(key, callback));
  },
  set(key: string, value: unknown): Promise<void> {
    return call((callback) => window.Homey.set(key, value, callback));
  },
  api<T>(method: string, path: string): Promise<T> {
    return call((callback) => window.Homey.api(method, path, {}, callback));
  },
  alert(message: string) {
    window.Homey.alert(message);
  }
};

export default Homey;

export function showError(error: unknown): undefined {
  Homey.alert(String(error));
  return undefined;
}
