/** Auth module route paths — owned by the auth module, not the global registry. */
export const AUTH_ROUTES = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  REGISTER_STUDENT: "/auth/register/student",
  REGISTER_SCHOOL: "/auth/register/school",
  REGISTER_PARENT: "/auth/register/parent",
  REGISTER_TEACHER: "/auth/register/teacher",
  REGISTER_VERIFY: "/auth/register/verify",
  REGISTER_SUCCESS: "/auth/register/success",
} as const;
