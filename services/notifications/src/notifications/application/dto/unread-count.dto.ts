export class UnreadCountDTO {
  constructor(public readonly count: number) {}

  toJSON(): object {
    return { count: this.count };
  }
}
