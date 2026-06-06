/** Auth module route paths — owned by the auth module, not the global registry. */
export const AUTH_ROUTES = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  REGISTER_VERIFY: "/auth/register/verify",
  REGISTER_SUCCESS: "/auth/register/success",
} as const;
