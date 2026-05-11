export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresAt: string;
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  displayName?: string | null;
}

export interface UserApiKeySummary {
  id: string;
  name: string;
  preview: string;
  createdAt: string;
  lastUsedAt?: string | null;
  revokedAt?: string | null;
  isRevoked: boolean;
}

export interface CreatedApiKeyResponse {
  apiKey: string;
  summary: UserApiKeySummary;
}
