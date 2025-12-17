import { PaginatedUserResponseDto } from '../../../src/users/dto/paginated-user-response.dto';

describe('PaginatedUserResponseDto', () => {
  it('assigns followers and following with totals', () => {
    const followers = ['userA', 'userB'];
    const totalFollowers = 2;
    const following = ['userC'];
    const totalFollowing = 1;

    const dto = new PaginatedUserResponseDto(
      followers,
      totalFollowers,
      following,
      totalFollowing,
    );

    expect(dto.followers).toEqual(followers);
    expect(dto.totalFollowers).toBe(totalFollowers);
    expect(dto.following).toEqual(following);
    expect(dto.totalFollowing).toBe(totalFollowing);
  });

  it('handles empty arrays and zero totals', () => {
    const dto = new PaginatedUserResponseDto<string>([], 0, [], 0);

    expect(dto.followers).toEqual([]);
    expect(dto.totalFollowers).toBe(0);
    expect(dto.following).toEqual([]);
    expect(dto.totalFollowing).toBe(0);
  });
});
