# Nawabegh — Parent Children Management API

**Audience:** Parent web — إدارة الأبناء  
**Controller:** `ParentChildrenController`  
**Base path:** `/api/v1/Parent/children`  
**Role:** `Parent`  
**Auth:** `Authorization: Bearer {parent_access_token}`  
**Response:** `Result<T>`

Related: [Parent_Dashboard_API.md](./Parent_Dashboard_API.md) · [Parent_Payments_API.md](./Parent_Payments_API.md) · [PARENT_TEACHER_REGISTRATION_API.md](./PARENT_TEACHER_REGISTRATION_API.md)

---

## Screen map

| UI | Endpoint |
|----|----------|
| أبناءي grid | `GET /api/v1/Parent/children` |
| إضافة ابن → create new | `GET .../create-defaults` + `POST /api/v1/Parent/children` |
| إضافة ابن → search existing | `GET .../search?keyword=` |
| تأكيد الربط | `POST .../link` `{ "studentUserId": "..." }` |
| التفاصيل | `GET .../{studentUserId}` |
| تبويب الدورات | `GET .../{studentUserId}/courses` |
| تبويب التقارير | `GET .../{studentUserId}/reports` |
| الجدول الأسبوعي | `GET .../{studentUserId}/schedule/weekly` |
| تصفح الدورات للاشتراك | `GET /api/v1/Parent/courses/catalog?studentUserId=` |
| دفع الرسوم | Use [Parent_Payments_API.md](./Parent_Payments_API.md) with `studentUserId` |
| إلغاء الربط | `DELETE .../{studentUserId}/unlink` |

---

## 1. List children

```http
GET /api/v1/Parent/children
```

```json
{
  "isSuccess": true,
  "data": [
    {
      "studentUserId": "guid",
      "fullName": "أحمد خالد",
      "profileImageUrl": null,
      "gradeNameAr": "الصف السادس",
      "educationLevelNameAr": "ابتدائي",
      "schoolName": "مدرسة النوابغ",
      "username": "ahmed.k",
      "isActive": true
    }
  ]
}
```

Card buttons:

- **التفاصيل** → `GET /Parent/children/{studentUserId}`
- **دفع الرسوم** → Parent payments with that `studentUserId`

---

## 2. Search / verify existing student (تحقق)

```http
GET /api/v1/Parent/children/search?keyword=IS-2024-XXXX&pageNumber=1&pageSize=20
```

| Rule | Value |
|------|--------|
| Keyword | Min **2** characters |
| Scope | Same `countryId` as parent; active students only |
| Fields searched | **UserId (GUID)**, exact **username/link code**, name, email, phone |

Response item includes `studentUserId` + `alreadyLinked` — if `alreadyLinked=true`, disable إضافة.

**UI Verify button:** call this with the link code / student id, show the returned card, then call `POST /link`.

---

## 3. Link existing student

```http
POST /api/v1/Parent/children/link
Content-Type: application/json

{ "studentUserId": "guid" }
```

Or by username / link code:

```json
{ "usernameOrLinkCode": "IS-2024-XXXX" }
```

Aliases accepted: `linkCode`, `username`.

- Same country required  
- Does **not** create a new account  
- Conflict if already linked  

---

## 4. Create new student

### Defaults (form pre-fill)

```http
GET /api/v1/Parent/children/create-defaults
```

Returns parent `countryId`, phone, address, `academicTerm`.

### Create

```http
POST /api/v1/Parent/children
Content-Type: application/json
```

```json
{
  "fullName": "أحمد محمد",
  "email": "ahmed.student@example.com",
  "password": "password123",
  "phoneNumber": "501234567",
  "phoneCountryCode": 966,
  "address": "الرياض",
  "educationLevelId": 1,
  "gradeId": 3,
  "schoolId": "guid-or-null",
  "academicTerm": 1
}
```

| Field | Required | Notes |
|-------|----------|--------|
| `fullName` | Yes | Max 200 |
| `email` | Yes | Unique; OTP sent here |
| `password` | Yes | Min 8 |
| `phoneNumber` | Yes | |
| `educationLevelId` | Yes | |
| `gradeId` | Yes | |
| `schoolId` | No | Must match country if set |
| `academicTerm` | No | `1` or `2`, default `1` |
| `countryId` | No | Defaults to parent country |

**Parent link:** created in the **same request** (`ParentStudents` row) via `ParentUserId` — no separate link call needed. Child appears in `GET /children` immediately after success (before OTP confirm).

### OTP (after create)

```http
POST /api/v1/Auth/confirm-email-otp
{ "email": "ahmed.student@example.com", "otp": "123456" }

POST /api/v1/Auth/resend-email-otp
{ "email": "ahmed.student@example.com" }
```

**Do not replace** the parent JWT with the student login payload from confirm-otp.

### Dropdowns (public)

- `GET /api/v1/School/dropdown?countryId=`
- `GET /api/v1/EducationLevels/dropdown?countryId=`
- `GET /api/v1/Grades/dropdown?educationLevelId=`

---

## 5. Child details (التفاصيل)

```http
GET /api/v1/Parent/children/{studentUserId}
```

Includes: profile, progress %, points, school rank, achievements count, exam stats, weekly activity, recent activities.

Only linked children.

---

## 6. Child weekly schedule

```http
GET /api/v1/Parent/children/{studentUserId}/schedule/weekly?weekStart=2026-07-12
```

Same schedule shape as the student weekly API; parent must be linked to the child.

---

## 7. Unlink

```http
DELETE /api/v1/Parent/children/{studentUserId}/unlink
```

Removes `ParentStudents` link only — student account remains.

---

## Quick reference

| Method | Path |
|--------|------|
| `GET` | `/api/v1/Parent/children` |
| `GET` | `/api/v1/Parent/children/search?keyword=` |
| `GET` | `/api/v1/Parent/children/create-defaults` |
| `GET` | `/api/v1/Parent/children/{studentUserId}` |
| `GET` | `/api/v1/Parent/children/{studentUserId}/schedule/weekly` |
| `POST` | `/api/v1/Parent/children` |
| `POST` | `/api/v1/Parent/children/link` |
| `DELETE` | `/api/v1/Parent/children/{studentUserId}/unlink` |

## Frontend checklist

- [ ] List cards from `GET /children`
- [ ] إضافة ابن: search **or** create-new form
- [ ] Search → preview → `POST /link`
- [ ] Create → OTP → keep parent session
- [ ] التفاصيل → `GET /{id}`
- [ ] دفع الرسوم → [Parent_Payments_API.md](./Parent_Payments_API.md)
- [ ] Schedule → `GET /{id}/schedule/weekly`
