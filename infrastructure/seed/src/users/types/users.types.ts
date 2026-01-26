import { Tag } from "../../tags.schema";

type BaseSeedUser = {
  id: string;
  role: "member" | "organization";
  username: string;
  email: string;
  darkMode: boolean;
  language: string;
  interests?: Tag[];
  name: string;
  avatar: string;
  bio?: string;
};

export type SeedMember = BaseSeedUser & {
  role: "member";
  gender?: "male" | "female";
  birthDate?: string;
  contacts?: never;
};

export type SeedOrganization = BaseSeedUser & {
  role: "organization";
  contacts?: string[];
  gender?: never;
  birthDate?: never;
};

export type SeedUser = SeedMember | SeedOrganization;

export interface UserSeedResult {
  users: SeedUser[];
}
