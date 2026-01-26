import { Tag } from "../../tags.schema";

export interface LoginResponseDTO {
  id: string;
  accessToken: string;
}

export interface UpdateAccountDTO {
  darkMode?: boolean;
  language?: string;
  gender?: "male" | "female";
  birthDate?: string;
  interests?: Tag[];
}

export interface UpdateProfileDTO {
  name?: string;
  bio?: string;
  contacts?: string[];
}

export interface UpdateUserRequestDTO {
  accountDTO?: UpdateAccountDTO;
  profileDTO?: UpdateProfileDTO;
}

export interface AvatarResponseDTO {
  userId: string;
  avatarUrl: string;
}
