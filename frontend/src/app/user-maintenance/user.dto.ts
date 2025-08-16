// This interface defines the shape of the user object received from the backend.
export interface UserDto {
  id: number;
  userName: string;
  userEmail: string;
  roles: string[];
  enabled: boolean;
}

// This interface defines the shape of the object sent to the backend for creating or updating a user.
export interface UserUpsertDto {
  userName: string;
  userEmail:string;
  password?: string; // Password is optional on updates
  roles: string[];
}
