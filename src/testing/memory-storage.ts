/** Faux Storage en mémoire pour les tests, capable de simuler un stockage plein ou inaccessible. */
export class MemoryStorage implements Storage {
  private readonly items = new Map<string, string>();

  /** Fait lever QuotaExceededError à setItem. */
  full = false;
  /** Fait lever une SecurityError à chaque accès. */
  blocked = false;

  constructor(initial: Record<string, string> = {}) {
    for (const [key, value] of Object.entries(initial)) {
      this.items.set(key, value);
    }
  }

  get length(): number {
    this.guard();
    return this.items.size;
  }

  clear(): void {
    this.guard();
    this.items.clear();
  }

  getItem(key: string): string | null {
    this.guard();
    return this.items.get(key) ?? null;
  }

  key(index: number): string | null {
    this.guard();
    return Array.from(this.items.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.guard();
    this.items.delete(key);
  }

  setItem(key: string, value: string): void {
    this.guard();
    if (this.full) {
      throw new DOMException('Le quota est dépassé.', 'QuotaExceededError');
    }
    this.items.set(key, value);
  }

  private guard(): void {
    if (this.blocked) {
      throw new DOMException('Accès refusé.', 'SecurityError');
    }
  }
}
