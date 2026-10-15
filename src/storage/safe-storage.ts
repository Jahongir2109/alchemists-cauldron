// localStorage can throw (private mode, quota, blocked storage) and can hold
// broken data. These helpers never throw: the game keeps working without storage.

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const readJson = (key: string): unknown => {
  try {
    const raw: string | null = localStorage.getItem(key);

    return raw === null ? null : (JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
};

export const writeJson = (key: string, value: unknown): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));

    return true;
  } catch {
    return false;
  }
};

export const removeItem = (key: string): boolean => {
  try {
    localStorage.removeItem(key);

    return true;
  } catch {
    return false;
  }
};
