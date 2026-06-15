import { TEACHER_MOCK_PROFILE } from "@/modules/teacher/domain/data/teacherMockProfile";

const MOCK_USER_ID = "mock-teacher-001";
export const TEACHER_MOCK_ACCESS_TOKEN = "mock-teacher-access-token";
const MOCK_REFRESH_TOKEN = "mock-teacher-refresh-token";

/** Allow mock teacher login in local dev until backend provisions a teacher account. */
export function isTeacherMockLoginEnabled() {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_AUTH_MOCK_TEACHER === "true"
  );
}

export function matchesTeacherMockCredentials(email: string, password: string) {
  return (
    email.toLowerCase() === TEACHER_MOCK_PROFILE.email.toLowerCase() &&
    password === TEACHER_MOCK_PROFILE.password
  );
}

export function isTeacherMockAccessToken(token?: string | null) {
  return token === TEACHER_MOCK_ACCESS_TOKEN;
}

export function buildTeacherMockAuthorizeUser() {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  return {
    id: MOCK_USER_ID,
    name: TEACHER_MOCK_PROFILE.name,
    email: TEACHER_MOCK_PROFILE.email,
    image: undefined,
    role: "Teacher",
    domainUid: null as string | null,
    accessToken: TEACHER_MOCK_ACCESS_TOKEN,
    refreshToken: MOCK_REFRESH_TOKEN,
    accessTokenExpiresAt: expiresAt,
  };
}
