import apiClient from './client';
import { TokenResponse, PaperlessApiError } from '@/types';
import { AxiosError } from 'axios';

/**
 * Error string returned by Paperless-ngx when MFA is enabled
 * but no TOTP code was provided.
 */
export const MFA_REQUIRED_ERROR = 'MFA code is required';
export const MFA_INVALID_ERROR = 'Invalid MFA code';

export class MfaRequiredError extends Error {
  constructor() {
    super(MFA_REQUIRED_ERROR);
    this.name = 'MfaRequiredError';
  }
}

export const authApi = {
  /**
   * Authenticate against /api/token/.
   * @param username - Paperless username
   * @param password - Paperless password
   * @param code - Optional 6-digit TOTP code (only needed when MFA is enabled)
   * @throws MfaRequiredError when server demands a TOTP code
   * @throws AxiosError for all other failures
   */
  login: async (username: string, password: string, code?: string): Promise<TokenResponse> => {
    try {
      const payload: Record<string, string> = { username, password };
      if (code) {
        payload.code = code;
      }
      const { data } = await apiClient.post<TokenResponse>('/api/token/', payload);
      return data;
    } catch (err) {
      const axiosErr = err as AxiosError<PaperlessApiError>;
      const errors = axiosErr.response?.data?.non_field_errors;
      if (errors?.some((e) => e.includes(MFA_REQUIRED_ERROR))) {
        throw new MfaRequiredError();
      }
      throw err;
    }
  },
};
