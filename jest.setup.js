const store = new Map();

const mockAsyncStorage = {
  setItem: jest.fn(async (key, value) => {
    store.set(key, String(value));
    return null;
  }),
  getItem: jest.fn(async (key) => {
    return store.has(key) ? store.get(key) : null;
  }),
  multiGet: jest.fn(async (keys) => {
    return keys.map((key) => [key, store.has(key) ? store.get(key) : null]);
  }),
  removeItem: jest.fn(async (key) => {
    store.delete(key);
    return null;
  }),
  multiRemove: jest.fn(async (keys) => {
    keys.forEach((key) => store.delete(key));
    return null;
  }),
  clear: jest.fn(async () => {
    store.clear();
    return null;
  }),
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.setTimeout(30000);



