/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserType = 'customer' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'disabled';

export interface UserProfile {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  user_type: UserType;
  status: UserStatus;
  role_id?: string | null;
  is_deleted: boolean;
  created_at: string;
}

export type AuthSubView = 'login' | 'forgot_password' | 'signup_info';

export type AuthStatus =
  | 'idle'
  | 'validating'
  | 'signing_in'
  | 'restoring'
  | 'success'
  | 'invalid_credentials'
  | 'account_suspended'
  | 'account_disabled'
  | 'user_not_found'
  | 'invalid_user_type'
  | 'session_expired'
  | 'network_error'
  | 'server_error';

export interface AuthErrorDetails {
  messageAr: string;
  technicalMessage?: string;
  code?: string;
}
