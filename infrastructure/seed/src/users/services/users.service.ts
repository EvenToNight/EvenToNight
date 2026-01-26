import axios from "axios";
import { UserSeedInput } from "../schemas/user.schema";
import { USERS_BASE_URL } from '../../config/env';
import { removeUndefined } from "../../utils";
import { LoginResponseDTO, UpdateUserRequestDTO, AvatarResponseDTO } from "../types/dto";
import fs from "fs";
import FormData from "form-data";

export async function registerUser(user: UserSeedInput): Promise<{userId: string, token: string}> {
  try {
    const body = {
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role
    }
    const response = await axios.post<LoginResponseDTO>(`${USERS_BASE_URL}/register`, body);
    return { userId: response.data.id, token: response.data.accessToken };

  } catch (err: any) {
    console.error(`Failed to register user ${user.username}`, err.response?.data || err.message);
    throw err;
  }
}

export async function updateUser(userId: string, user: UserSeedInput, token: string): Promise<void> {
  try {
    const accountDTO = removeUndefined({
      darkMode: user.darkMode ?? false,
      language: user.language ?? "en",
      interests: user.interests
    });

    const profileDTO = removeUndefined({
      name: user.name,
      bio: user.bio
    });

    if (user.role === "member") {
      Object.assign(
        accountDTO, removeUndefined({gender: user.gender, birthDate: user.birthDate})
      );
    }

    if (user.role === "organization") {
      Object.assign(
        profileDTO, removeUndefined({contacts: user.contacts})
      );
    }

    const body: UpdateUserRequestDTO = {accountDTO, profileDTO};

    await axios.put(`${USERS_BASE_URL}/${userId}`, body, {
      headers: { Authorization: `Bearer ${token}` },
    });

  } catch (err: any) {
    console.error(`Failed to update user ${user.username}`, err.response?.data || err.message);
    throw err;
  }
}

export async function updateAvatar(userId: string, token: string, avatarFilePath: string): Promise<AvatarResponseDTO> {
  const formData = new FormData();
  formData.append("avatar", fs.createReadStream(avatarFilePath));

  const response = await axios.post<AvatarResponseDTO>(`${USERS_BASE_URL}/${userId}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      ...formData.getHeaders(),
    },
  });

  return response.data;
}
