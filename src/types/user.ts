/**
 * Representa os dados de um usuário que são seguros para serem expostos no cliente.
 * Corresponde aos dados que obtemos do Firebase Admin SDK.
 */
export interface AppUser {
  uid: string;
  email: string | undefined;
  displayName: string | undefined;
  photoURL: string | undefined;
  disabled: boolean;
  createdAt: string;
}

/**
 * Representa os dados necessários para criar um novo usuário.
 */
export type NewUser = {
  email: string;
  password?: string;
  displayName?: string;
};
