# Explore Courses — Grade Filters API

**Audience:** Flutter / mobile + web frontend teams  
**Screen:** استكشف الدورات (Explore Courses)  
**Base URL:** `https://{api-host}/api/v1`  
**Swagger:** `https://{api-host}/swagger/index.html`

**Related:**
- [STUDENT_COURSES_CATALOG_API.md](./STUDENT_COURSES_CATALOG_API.md) — full catalog, course cards, `actionLabel`, detail endpoint
- [FRONTEND_STUDENT_HANDOFF.md](./FRONTEND_STUDENT_HANDOFF.md) — student journey index

---

## Table of contents

1. [Quick facts](#quick-facts)
2. [Breaking change](#breaking-change)
3. [Request — query parameters](#request--query-parameters)
4. [Response shape](#response-shape)
5. [Grade filters (`gradeFilters`)](#grade-filters-gradefilters)
6. [Courses list (`courses`)](#courses-list-courses)
7. [Pagination](#pagination)
8. [Frontend integration](#frontend-integration)
9. [Examples](#examples)
10. [Migration checklist](#migration-checklist)

---

## Quick facts

| Item | Value |
|------|--------|
| Endpoint | `GET /api/v1/Course/explore` |
| Auth | **Optional** — send Bearer token for enrollment personalization on cards |
| Grade filter param | `gradeId` (int, optional) |
| Grade chips data | `data.gradeFilters[]` in response body |
| Course grid | `data.courses[]` |
| Subtitle count | `data.totalCoursesCount` |
| Pagination | `X-Pagination` response header (applies to `courses`) |

---

## Breaking change

`GET /Course/explore` **no longer** returns `data` as a plain course array.

### Before

```json
{
  "isSuccess": true,
  "data": [ /* ExploreCourseCardResponse[] */ ]
}
```

### After

```json
{
  "isSuccess": true,
  "data": {
    "totalCoursesCount": 50,
    "gradeFilters": [ /* ExploreGradeFilterOptionDto[] */ ],
    "courses": [ /* ExploreCourseCardResponse[] */ ]
  }
}
```

**Migration:**

```diff
- const courses = response.data;
+ const { totalCoursesCount, gradeFilters, courses } = response.data;
```

---

## Request — query parameters

```http
GET /api/v1/Course/explore?subjectId=2&gradeId=5&keyword=رياضيات&pageNumber=1&pageSize=20
Authorization: Bearer {token}   // optional
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `gradeId` | `int?` | — | Filter courses by grade (الصف) |
| `subjectId` | `int?` | — | Filter by subject/category |
| `keyword` | `string?` | — | Search in course **title** (case-insensitive) |
| `term` | `int?` | — | `1` FirstTerm · `2` SecondTerm · `3` ThirdTerm |
| `teacherId` | `guid?` | — | Filter by teacher |
| `accessType` | `int?` | — | `0` Free · `1` Paid · `2` Subscription |
| `pageNumber` | `int` | `1` | Page index |
| `pageSize` | `int` | `50` | Items per page |

### `accessType` enum

| Value | Meaning |
|-------|---------|
| `0` | Free |
| `1` | Paid |
| `2` | Subscription |

### `term` enum

| Value | Meaning |
|-------|---------|
| `1` | First term |
| `2` | Second term |
| `3` | Third term |

---

## Response shape

```json
{
  "isSuccess": true,
  "data": {
    "totalCoursesCount": 50,
    "gradeFilters": [
      {
        "id": 5,
        "nameAr": "الصف الثالث الثانوي",
        "nameEn": "Grade 12",
        "educationLevelId": 3,
        "educationLevelNameAr": "المرحلة الثانوية",
        "educationLevelNameEn": "Secondary",
        "order": 12,
        "coursesCount": 8
      }
    ],
    "courses": []
  },
  "status": "Success",
  "statusCode": 200
}
```

---

## Grade filters (`gradeFilters`)

Returned in the same `GET /Course/explore` call — **no separate endpoint**.

Use for the horizontal **grade chips row** on استكشف الدورات.

| Field | Type | UI use |
|-------|------|--------|
| `id` | `int` | Send as `gradeId` query param when chip is selected |
| `nameAr` | `string` | Chip label (Arabic) |
| `nameEn` | `string` | Chip label (English) |
| `educationLevelId` | `int` | Optional grouping by education level |
| `educationLevelNameAr` | `string` | Optional section header (Arabic) |
| `educationLevelNameEn` | `string` | Optional section header (English) |
| `order` | `int` | Display sort order |
| `coursesCount` | `int` | Badge count on chip (e.g. `8 دورة`) |

### Counting rules

| Field | Includes `gradeId` filter? | Includes other filters? |
|-------|------------------------------|-------------------------|
| `gradeFilters[].coursesCount` | **No** | Yes — `subjectId`, `keyword`, `term`, `teacherId`, `accessType` |
| `totalCoursesCount` | **Yes** | Yes — all active filters |
| `X-Pagination.totalCount` | **Yes** | Yes — same as filtered `courses` list |

This lets the user switch between grades while counts stay meaningful under the current subject/search filters.

### Only grades with courses

`gradeFilters` lists **only grades that have at least one published approved course** under the current non-grade filters.

### "All grades" chip

Handled client-side: omit `gradeId` from the query. Backend does not return an "all" item in `gradeFilters`.

---

## Courses list (`courses`)

Same card shape as before — see [STUDENT_COURSES_CATALOG_API.md](./STUDENT_COURSES_CATALOG_API.md) for full `ExploreCourseCardResponse` fields.

Key fields for the grid:

| Field | UI use |
|-------|--------|
| `id` | Navigate to detail |
| `title` | Card title |
| `coverImageUrl` | Thumbnail |
| `subjectNameAr` | Subject badge |
| `gradeNameAr` | Grade badge |
| `teacherFullName` | Instructor line |
| `originalPrice` / `discountedPrice` | Pricing |
| `isBestSeller` | Best-seller badge |
| `actionLabel` | CTA button (`Enroll`, `Purchase`, `Continue`, `Renew`) |
| `isEnrolled` / `progressPercentage` | Enrolled state (with token) |

**Course detail (on card tap):** unchanged — `GET /api/v1/Course/explore/details/{courseId}`

---

## Pagination

Pagination metadata is in the **`X-Pagination`** header and applies to `data.courses`:

```
X-Pagination: {"currentPage":1,"totalPages":3,"pageSize":20,"totalCount":50,"hasPrevious":false,"hasNext":true}
```

| Header field | Maps to |
|--------------|---------|
| `totalCount` | Filtered course count (with `gradeId` if set) |
| `currentPage` / `totalPages` | Page navigation for `courses` |

`data.totalCoursesCount` equals `X-Pagination.totalCount` for the current filter set.

---

## Frontend integration

| UI (استكشف الدورات) | API |
|----------------------|-----|
| Header subtitle — "اختر بين N دورة" | `data.totalCoursesCount` |
| Grade chips row | `data.gradeFilters` |
| "N دورة" on each chip | `gradeFilters[].coursesCount` |
| Course grid | `data.courses` |
| Select grade chip | Re-fetch with `gradeId={id}` |
| "الكل" (all grades) | Omit `gradeId` |
| Subject tabs | `subjectId` param (recounts `gradeFilters`) |
| Search bar | `keyword` param |
| Infinite scroll / pages | `pageNumber` + `pageSize` + `X-Pagination` |

### Recommended flow

```
1. GET /Course/explore?pageNumber=1&pageSize=20
   → render gradeFilters + courses + totalCoursesCount

2. User taps grade id=5
   → GET /Course/explore?gradeId=5&pageNumber=1&pageSize=20

3. User selects subject id=2 (keep grade)
   → GET /Course/explore?subjectId=2&gradeId=5&pageNumber=1&pageSize=20
   → gradeFilters recount for subject=2 (without locking to grade 5 in counts)

4. User clears grade ("الكل")
   → GET /Course/explore?subjectId=2&pageNumber=1&pageSize=20
```

---

## Examples

### Initial load

```http
GET /api/v1/Course/explore?pageNumber=1&pageSize=20
```

### Filter by grade

```http
GET /api/v1/Course/explore?gradeId=5&pageNumber=1&pageSize=20
```

### Subject + grade + search

```http
GET /api/v1/Course/explore?subjectId=2&gradeId=5&keyword=ذكاء&pageNumber=1&pageSize=20
```

### Example `gradeFilters` item

```json
{
  "id": 5,
  "nameAr": "الصف الثالث الثانوي",
  "nameEn": "Grade 12",
  "educationLevelId": 3,
  "educationLevelNameAr": "المرحلة الثانوية",
  "educationLevelNameEn": "Secondary",
  "order": 12,
  "coursesCount": 8
}
```

---

## Migration checklist

- [ ] Change `response.data` from array to `{ totalCoursesCount, gradeFilters, courses }`
- [ ] Build grade chips from `data.gradeFilters` (add client-side "الكل" chip)
- [ ] On grade select → pass `gradeId` query param and reset to `pageNumber=1`
- [ ] Use `data.totalCoursesCount` for header subtitle
- [ ] Keep reading pagination from `X-Pagination` header
- [ ] Course card rendering — no changes (same card fields inside `data.courses`)
- [ ] Course detail — still `GET /Course/explore/details/{id}`

---

## Quick reference

| Item | Value |
|------|--------|
| List + grade filters | `GET /api/v1/Course/explore` |
| Grade filter param | `gradeId` |
| Grade chips source | `data.gradeFilters` |
| Courses source | `data.courses` |
| Total count | `data.totalCoursesCount` |
| Course detail | `GET /api/v1/Course/explore/details/{courseId}` |
