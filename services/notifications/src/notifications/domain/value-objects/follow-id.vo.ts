import { v4 as uuidv4 } from "uuid";

export class FollowId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("FollowId cannot be empty");
    }
  }

  static generate(): FollowId {
    return new FollowId(uuidv4());
  }

  static fromString(id: string): FollowId {
    return new FollowId(id);
  }

  toString(): string {
    return this.value;
  }

  equals(other: FollowId): boolean {
    return this.value === other.value;
  }
}
