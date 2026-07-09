# Password Flows API

Base URL: `https://api.nwabigh.com/api/v1`

---

## Flow 1: Forgot Password (OTP Reset)

For users who forgot their password. No authentication required.

```
[User] → forgot-password → [Email with OTP] → reset-password → [Done]
```

### Step 1 — Request OTP

#### `POST /Auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (always 200 — never reveals if email exists):**
```json
{
  "isSuccess": true,
  "data": true,
  "status": "Success",
  "statusCode": 200,
  "message": "إذا كان البريد الإلكتروني مسجلاً، ستصلك رسالة تحتوي على رمز إعادة التعيين"
}
```

> The API always returns success regardless of whether the email exists — this is intentional for security.
> An OTP code is sent to the user's email if the account exists and email is confirmed.

---

### Step 2 — Reset Password with OTP

#### `POST /Auth/reset-password`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewPass@123",
  "confirmPassword": "NewPass@123"
}
```

**Success Response:**
```json
{
  "isSuccess": true,
  "data": true,
  "status": "Success",
  "statusCode": 200,
  "message": "تم إعادة تعيين كلمة المرور بنجاح"
}
```

**Failure — OTP wrong or expired:**
```json
{
  "isSuccess": false,
  "status": "Error",
  "statusCode": 500,
  "error": { "message": "الرمز غير صحيح أو منتهي الصلاحية" }
}
```

**Failure — Passwords don't match:**
```json
{
  "isSuccess": false,
  "status": "Error",
  "statusCode": 500,
  "error": { "message": "كلمتا المرور غير متطابقتين" }
}
```

> After successful reset, the user receives a confirmation email.

---

## Flow 2: Change Password (Logged-in Teacher)

For teachers who know their current password and want to change it.
Requires a valid **Teacher JWT token**.

### `POST /Teacher/account/change-password`

**Headers:**
```
Authorization: Bearer <teacher_access_token>
```

**Request Body:**
```json
{
  "currentPassword": "OldPass@123",
  "newPassword": "NewPass@456",
  "confirmPassword": "NewPass@456"
}
```

**Success Response:**
```json
{
  "isSuccess": true,
  "data": true,
  "status": "Success",
  "statusCode": 200,
  "message": "تم تغيير كلمة المرور بنجاح"
}
```

**Failure — Wrong current password:**
```json
{
  "isSuccess": false,
  "status": "Error",
  "error": { "message": "كلمة المرور الحالية غير صحيحة" }
}
```

**Failure — Passwords don't match:**
```json
{
  "isSuccess": false,
  "status": "Error",
  "error": { "message": "كلمتا المرور غير متطابقتين" }
}
```

---

## Flow 3: Email Confirmation OTP (After Registration)

For new users who just registered and need to verify their email.

```
[Register] → [Email with OTP] → confirm-email-otp → [Logged in]
```

### Step 1 — Register (any role)

`POST /Auth/parent-registration` / `student-registration` / `teacher-registration`

An OTP is automatically sent to the provided email.

### Step 2 — Confirm Email

#### `POST /Auth/confirm-email-otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Success Response** — returns full login payload (JWT + user info):
```json
{
  "isSuccess": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "...",
    "expiresAt": "2026-07-09T12:00:00Z",
    "user": {
      "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "fullName": "محمد أحمد",
      "email": "user@example.com",
      "role": "Student",
      "profileImageUrl": null
    }
  }
}
```

### Step 3 — Resend OTP (if expired)

#### `POST /Auth/resend-email-otp`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

---

## Password Requirements

| Rule | Requirement |
|---|---|
| Minimum length | 8 characters |
| Uppercase letter | At least 1 |
| Lowercase letter | At least 1 |
| Number | At least 1 |
| Special character | At least 1 (e.g. `@`, `#`, `!`) |

**Example valid password:** `MyPass@123`

---

## Summary Table

| Flow | Endpoint | Auth Required | Role |
|---|---|---|---|
| Request forgot-password OTP | `POST /Auth/forgot-password` | ❌ No | Any |
| Reset password with OTP | `POST /Auth/reset-password` | ❌ No | Any |
| Change password (logged in) | `POST /Teacher/account/change-password` | ✅ Yes | Teacher |
| Confirm email OTP | `POST /Auth/confirm-email-otp` | ❌ No | Any |
| Resend email OTP | `POST /Auth/resend-email-otp` | ❌ No | Any |
