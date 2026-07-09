# Admin User Management API

Base URL: `https://api.nwabigh.com/api/v1`

All endpoints require an **Admin JWT token** in the `Authorization: Bearer <token>` header.

---

## Response Envelope

Every response follows:
```json
{
  "isSuccess": true,
  "data": { ... },
  "error": { "message": "", "errorCode": null, "validationErrors": null },
  "status": "Success",
  "statusCode": 200
}
```

---

## 1. Roles Dropdown

### `GET /UserManagement/roles/dropdown`

Returns all available roles for use in dropdowns.

**Query Params:**
| Param | Type | Default | Description |
|---|---|---|---|
| `pageNumber` | int | 1 | Page number |
| `pageSize` | int | 10 | Items per page |

**Response `data`:**
```json
[
  { "id": 1, "name": "Teacher" },
  { "id": 2, "name": "Student" },
  { "id": 3, "name": "Parent" },
  { "id": 4, "name": "Admin" }
]
```

---

## 2. User Statistics

### `GET /UserManagement/stats`

Returns counts of all user types.

**Response `data`:**
```json
{
  "totalUsers": 10,
  "totalStudents": 5,
  "totalTeachers": 3,
  "totalParents": 2
}
```

---

## 3. List Users (Paginated)

### `GET /UserManagement/page`

**Query Params:**
| Param | Type | Description |
|---|---|---|
| `keyword` | string | Search by name, email, or phone |
| `role` | int? | Filter by role (1=Teacher, 2=Student, 3=Parent) |
| `pageNumber` | int | Page number |
| `pageSize` | int | Items per page |

### `GET /UserManagement/students/page`

Same as above but returns students only.

---

## 4. Get Profiles

### `GET /UserManagement/teacher/{userId}`
### `GET /UserManagement/student/{userId}`
### `GET /UserManagement/parent/{userId}`

Returns full profile of the specified user.

---

## 5. Search

### `GET /UserManagement/search-parent?phoneNumber=01xxxxxxxx`

Search parent by phone number.

### `GET /UserManagement/search-students?keyword=ahmed&take=20`

Search students by name/email/phone.

---

## 6. Create Teacher (Admin Only)

### `POST /UserManagement/teacher/create`

**Request Body:**
```json
{
  "fullName": "أحمد حسن",
  "email": "teacher@example.com",
  "password": "Teacher@123",
  "phoneNumber": "1234567890",
  "phoneCountryCode": 20,
  "countryId": 1,
  "jobTitle": "معلم رياضيات",
  "schoolName": "مدرسة النوابغ",
  "schoolId": null,
  "profileImageUrl": null,
  "address": "القاهرة، مصر",
  "assignedGradeIds": [101, 102],
  "canManageConversations": false
}
```

> **Note:** `canCreateLearningPaths`, `canStartLiveSessions`, `canUploadFiles`, `canAddExams` are always forced to `true` by the backend — no need to send them.

**Required Fields:** `fullName`, `email`, `password`, `phoneNumber`, `phoneCountryCode`, `countryId`, `jobTitle`, `schoolName`

**Response `data`:**
```json
{
  "userId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "fullName": "أحمد حسن",
  "email": "teacher@example.com",
  "role": "Teacher"
}
```

---

## 7. Update Teacher (Admin Only)

### `PUT /UserManagement/teacher/{userId}/update`

**Request Body:** (same fields as Create, plus `userId`)
```json
{
  "userId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "fullName": "أحمد حسن",
  "email": "teacher@example.com",
  "phoneNumber": "1234567890",
  "phoneCountryCode": 20,
  "countryId": 1,
  "jobTitle": "معلم رياضيات",
  "schoolName": "مدرسة النوابغ",
  "schoolId": null,
  "profileImageUrl": null,
  "address": "القاهرة، مصر",
  "assignedGradeIds": [101, 102],
  "canManageConversations": false,
  "about": null,
  "yearsOfExperience": null,
  "city": null,
  "rating": null,
  "certificatesJson": null
}
```

---

## 8. Create Parent (Admin Only)

### `POST /UserManagement/parent/create`

**Request Body:**
```json
{
  "fullName": "محمد علي",
  "email": "parent@example.com",
  "password": "Parent@123",
  "phoneNumber": "0987654321",
  "phoneCountryCode": 20,
  "countryId": 1,
  "profileImageUrl": null,
  "address": null,
  "childStudentUserIds": [
    "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  ]
}
```

**Required Fields:** `fullName`, `email`, `password`, `phoneNumber`, `phoneCountryCode`, `countryId`

`childStudentUserIds` — optional list of student IDs to link immediately on creation.

---

## 9. Update Parent (Admin Only)

### `PUT /UserManagement/parent/{userId}/update`

Same fields as Create plus `userId`.

---

## 10. Create Student (Admin Only)

### `POST /UserManagement/student/create`

**Request Body:**
```json
{
  "fullName": "سارة محمد",
  "email": "student@example.com",
  "password": "Student@123",
  "phoneNumber": "1122334455",
  "phoneCountryCode": 20,
  "countryId": 1,
  "gradeId": 101,
  "schoolId": null,
  "profileImageUrl": null
}
```

---

## 11. Update Student (Admin Only)

### `PUT /UserManagement/student/{userId}/update`

Same fields as Create plus `userId`.

---

## 12. Toggle User Status

### `PATCH /UserManagement/toggle-status`

Activates or deactivates a user account.

**Request Body:**
```json
{
  "userId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

---

## 13. Delete User

### `DELETE /UserManagement/{userId}/delete`

Soft-deletes a user from the system.

---

## 14. Link / Unlink Parent ↔ Student

### `POST /UserManagement/link-parent-student`

```json
{
  "parentUserId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "studentUserId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

### `POST /UserManagement/unlink-parent-student`

```json
{
  "parentUserId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "studentUserId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

---

## Self-Registration (Public — No Auth Required)

These endpoints are for the mobile/web app registration screens, not the admin dashboard:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/Auth/parent-registration` | Parent self-registers |
| `POST` | `/Auth/student-registration` | Student self-registers |
| `POST` | `/Auth/teacher-registration` | Teacher self-registers |
| `POST` | `/Auth/confirm-email-otp` | Confirm email via OTP after registration |
| `POST` | `/Auth/resend-email-otp` | Resend OTP to email |
