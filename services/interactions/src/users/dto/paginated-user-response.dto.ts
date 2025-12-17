export class PaginatedUserResponseDto<T> {
  followers: T[];
  totalFollowers: number;
  following: T[];
  totalFollowing: number;

  constructor(
    followers: T[],
    totalFollowers: number,
    following: T[],
    totalFollowing: number,
  ) {
    this.followers = followers;
    this.totalFollowers = totalFollowers;
    this.following = following;
    this.totalFollowing = totalFollowing;
  }
}
