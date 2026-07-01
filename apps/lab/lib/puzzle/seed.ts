export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedFromDate(dateStr: string): number {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = (Math.imul(31, h) + dateStr.charCodeAt(i)) | 0;
  }
  return h;
}

export function getDayNumber(dateStr: string): number {
  const epoch = new Date("2026-07-01T00:00:00Z");
  const current = new Date(`${dateStr}T00:00:00Z`);
  const diffTime = current.getTime() - epoch.getTime();
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, days + 1); // 2026-07-01 is Day 1
}

export function getTodayDateStringUTC(): string {
  return new Date().toISOString().split("T")[0];
}
