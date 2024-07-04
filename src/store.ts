const keyPrefix = '__dommapper-';

export const Store = {
  getPoints(id: string) {
    const stored = localStorage.getItem(keyPrefix + id);
    if (stored) return stored.split(',').map(Number);
    return null;
  },
  setPoints(id: string, points: number[]) {
    localStorage.setItem(keyPrefix + id, points.join(','));
  },
}
