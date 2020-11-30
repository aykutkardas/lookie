class Lookie {
  static set(key: string, value: any, expiryTimeMs: number) {
    const now = new Date().getTime();
    const expiry = now + expiryTimeMs;
    const data = JSON.stringify({
      value,
      expiry,
    });

    localStorage.setItem(key, data);
  }

  static get(key: string) {
    const dataStr = localStorage.getItem(key);

    if (!dataStr) {
      return null;
    }

    const item = JSON.parse(dataStr);
    const now = new Date().getTime();

    if (now > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return item.value;
  }
}

export default Lookie;
