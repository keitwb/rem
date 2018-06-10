
export class Filter {
  constructor(public key: string, public value: string) {}

  static fromString(s: string): Filter {
    const colonIdx = s.indexOf(':');
    if (colonIdx > 0) {
      return new Filter(s.substring(0, colonIdx).trim(), s.substring(colonIdx+1).trim());
    } else {
      return new Filter(null, s.trim());
    }
  }

  toString(): string {
    if (!this.key) {
      return this.value
    } else {
      return `${this.key}: ${this.value}`;
    }
  }

  get asString(): string {
    return this.toString();
  }
}
