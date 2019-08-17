import { InMemoryWallet } from "fabric-network";

export interface UserData {
  username: string;
  email: string;
  token: string;
}

export interface UserRO {
  user: UserData;
}

export interface UserWithFabricCredential {
  username: string;
  email: string;
  token: string;
  wallet: InMemoryWallet;
}