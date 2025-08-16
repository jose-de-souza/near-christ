export interface UserDto {
  id: number;
  userFullName: string;
  userEmail: string;
  roles: string[];
  enabled: boolean;
}

export interface UserUpsertDto {
  userFullName: string;
  userEmail:string;
  password?: string;
  roles: string[];
}
