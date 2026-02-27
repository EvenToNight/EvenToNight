export abstract class EntityId<T extends EntityId<T>> {
  protected constructor(
    private readonly value: string,
    errorFactory: () => Error,
  ) {
    if (!value || value.trim().length === 0) {
      throw errorFactory();
    }
  }

  equals(other: T): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }

  getValue(): string {
    return this.value;
  }
}
