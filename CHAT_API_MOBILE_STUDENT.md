# Nawabegh — Course Chat API (Mobile · Student)

**Version:** 1.0 (May 2026)  
**Audience:** Flutter / mobile team — **Student role only**  
**Not in scope:** Admin panel, teacher moderation, CMS chat management

**Related:** [LMS_FRONTEND_API_GUIDE.md](./LMS_FRONTEND_API_GUIDE.md) (auth, `Result<T>`) · Admin/teacher doc: [CHAT_API_ADMIN_AND_MOBILE.md](./CHAT_API_ADMIN_AND_MOBILE.md)

| Item | Value |
|------|--------|
| Base URL | `https://{api-host}` (no trailing slash) |
| Chat API | `/api/v1/Chat` |
| File upload | `POST /api/FileUpload/upload` |
| SignalR hub | `/hubs/course-chat` |

---

## Table of contents

1. [Overview](#1-overview)
2. [Before opening chat](#2-before-opening-chat)
3. [Chat thread screen](#3-chat-thread-screen)
4. [Group info screen](#4-group-info-screen)
5. [Send messages & attachments](#5-send-messages--attachments)
6. [Reactions & replies](#6-reactions--replies)
7. [Real-time (SignalR)](#7-real-time-signalr)
8. [Data models](#8-data-models)
9. [Errors](#9-errors)
10. [Endpoint reference (student)](#10-endpoint-reference-student)
11. [Flutter checklist](#11-flutter-checklist)

---

## 1. Overview

- Each **course** has **one** chat group, keyed by `courseId`.
- The group is created when the course is created (or when staff first opens chat). Students **cannot** create a group.
- Students may use chat only if they have an **active enrollment** in that course.
- Messages support text, typed attachments (image, PDF, PPT, voice), replies, and emoji reactions.
- **Leave group** is **not** supported — do not show «مغادرة المجموعة» in the student app.

```text
Enrolled in course
    → (optional) initialize progress once
    → open Chat tab
    → settings + messages + SignalR
    → optional: group info (details / media / files / participants)
```

---

## 2. Before opening chat

### 2.1 Authentication

Every request and the SignalR hub:

```http
Authorization: Bearer {access_token}
```

Role must include **Student**.

### 2.2 Enrollment

Student must be enrolled with `CourseEnrollment.isActive = true` for the course. Otherwise all chat calls return `403` (`chat access`).

### 2.3 Progress (recommended once per course)

Same as other learning-path features:

```http
POST /api/v1/progress/courses/{courseId}/initialize
```

| Response | Action |
|----------|--------|
| **200** | Progress created |
| **409** «تم تهيئة التقدّم لهذه الدورة مسبقاً» | Treat as success; continue |

If the teacher adds new stations later, refresh path progress (do **not** call initialize again):

```http
GET /api/v1/learning-paths/students/{learningPathId}/stations/progress
```

Alternate URL (same handler):

```http
GET /api/v1/progress/learning-paths/{learningPathId}
```

### 2.4 Open chat — bootstrap

```text
1. GET /api/v1/Chat/{courseId}/settings
2. GET /api/v1/Chat/{courseId}/messages?pageNumber=1&pageSize=30
3. Connect SignalR → JoinCourse(courseId)
```

| `GET settings` result | UI |
|----------------------|-----|
| **200** | Show chat |
| **404** | «الدردشة غير متاحة بعد» — group not created yet |
| **403** | Not enrolled |

---

## 3. Chat thread screen

### 3.1 Read settings

```http
GET /api/v1/Chat/{courseId}/settings
```

Use these flags to enable/disable the composer and attachment buttons:

| Field | Student UI |
|-------|----------------|
| `isLocked` | If `true` → read-only (no send); reactions may be blocked when locked |
| `isTeachersOnly` | If `true` → hide composer (teacher broadcast mode) |
| `allowAttachments` | Master switch for any attachment |
| `allowImages` | Show image picker |
| `allowDocuments` | Show PDF/PPT (and similar) picker |
| `allowWebLinks` | Allow `http://` / `https://` in message text |
| `displayName` | Optional header title override |
| `subjectNameAr` | Fallback label context |

### 3.2 Load messages (paginated)

```http
GET /api/v1/Chat/{courseId}/messages?pageNumber=1&pageSize=30
```

- Pinned messages appear first, then newest by `createdAt`.
- Load older pages with `pageNumber++`.
- Read `data.metaData` for `hasNext`, `totalCount`, etc. (see [LMS_FRONTEND_API_GUIDE.md](./LMS_FRONTEND_API_GUIDE.md)).

### 3.3 Composer rules (student)

Enable send when **all** are true:

- Not `isLocked`
- Not `isTeachersOnly`
- User is not banned (send returns `403` if banned)
- `content` or at least one attachment present

---

## 4. Group info screen

Opened from chat header (⋮). **No leave-group API.**

### 4.1 Load details

```http
GET /api/v1/Chat/{courseId}/details
```

| Field | UI (Arabic mockup) |
|-------|---------------------|
| `groupName` | عنوان المجموعة |
| `description` | وصف الدورة |
| `coverImageUrl` | صورة المجموعة (full URL) |
| `createdAt` | «أُنشئت في …» |
| `participantsCount` | عدد المشاركين |
| `mediaCount` | شارة تبويب الوسائط |
| `filesCount` | شارة تبويب الملفات |
| `isMuted` | كتم التنبيهات (initial) |
| `isPinnedInList` | تثبيت المجموعة (initial) |

### 4.2 Tab — الوسائط (images)

```http
GET /api/v1/Chat/{courseId}/media?pageNumber=1&pageSize=30
```

Returns shared **images** from chat (`attachmentType = 1`). Use `url` for grid thumbnails.

### 4.3 Tab — الملفات (documents)

```http
GET /api/v1/Chat/{courseId}/files?pageNumber=1&pageSize=20
```

Returns **PDF** and **PPT** attachments with `fileName`, `sizeInBytes`, `sharedAt`, `senderName`.

### 4.4 Participants — المشاركون

```http
GET /api/v1/Chat/{courseId}/participants
```

| Field | UI |
|-------|-----|
| `fullName`, `profileImageUrl` | Row avatar + name |
| `role` | `Teacher` or `Student` |
| `isGroupAdmin` | If `true` → show badge **مدير** (course teacher) |

### 4.5 Save toggles

```http
PUT /api/v1/Chat/{courseId}/member-preferences
```

```json
{
  "isMuted": true,
  "isPinnedInList": false
}
```

Per-user settings only (stored in `ChatGroupMemberPreferences`). Requires DB migration on server — see backend team if `500` on first use.

---

## 5. Send messages & attachments

### 5.1 Upload file first

```http
POST /api/FileUpload/upload
```

Use the returned path/URL in the send body (see upload guide in [ADMIN_CMS_CONTENT_CREATION_GUIDE.md](./ADMIN_CMS_CONTENT_CREATION_GUIDE.md#121-file-upload-before-saving-urls)).

### 5.2 Send message

```http
POST /api/v1/Chat/messages
```

**Ready-to-copy examples:** [json/ChatSendMessageExamples.json](./json/ChatSendMessageExamples.json) (text, image, PDF, reply, voice).

```json
{
  "courseId": "b6021120-f44c-4036-8fc5-979ab81e78bc",
  "content": "هذه صورة توضح فكرة التكامل الجزئي",
  "attachmentUrl": null,
  "replyToMessageId": null,
  "attachments": [
    {
      "attachmentType": 1,
      "url": "/uploads/.../img_abc.jpg",
      "fileName": "photo.jpg",
      "mimeType": "image/jpeg",
      "sizeInBytes": 102400
    }
  ]
}
```

**Response:** `data` = new message `Guid`.

### 5.3 `attachmentUrl` vs `attachments[]`

| | `attachmentUrl` | `attachments[]` (**use this**) |
|---|-----------------|--------------------------------|
| Purpose | Legacy single link on message | Typed files in `ChatMessageAttachments` |
| Metadata | URL only | `attachmentType`, `fileName`, `mimeType`, `sizeInBytes` |
| Media/Files tabs | Not listed | Appears in `/media` and `/files` |
| Type rules | Weak | Enforces `allowImages` / `allowDocuments` |

**Flutter:** always send `attachmentUrl: null` and use `attachments[]` only.

### 5.4 `ChatAttachmentType`

| Value | Name | Use |
|------:|------|-----|
| 1 | Image | Photos in chat + media tab |
| 2 | Pdf | Files tab |
| 3 | Ppt | Files tab |
| 4 | Voice | Voice note in thread |

### 5.5 Validation

- `content` is **optional** when you send at least one `attachments` item (or legacy `attachmentUrl`). Omit `content` or use `""` for file-only messages.
- Web links in text blocked when `allowWebLinks` is `false`.

---

## 6. Reactions & replies

### 6.1 Reply

Set `replyToMessageId` to the parent message `id` when calling `POST /messages`. Parent must exist in the same course chat.

### 6.2 Reactions

```http
POST   /api/v1/Chat/messages/{messageId}/reactions
DELETE /api/v1/Chat/messages/{messageId}/reactions
```

**Body:** raw JSON string with emoji only, e.g.:

```json
"👍"
```

Not an object — the body is literally `"👍"`.

---

## 7. Real-time (SignalR)

### 7.1 Connect

- Hub: `{baseUrl}/hubs/course-chat`
- Pass JWT (same as REST).
- After `start()`:

```text
invoke("JoinCourse", courseId)
```

On reconnect, call `JoinCourse` again.

### 7.2 Events (server → client)

| Event | When | Student action |
|-------|------|----------------|
| `chat.message.created` | New message | Refresh page 1 or append |
| `chat.message.deleted` | Teacher/admin deleted | Remove/hide message |
| `chat.message.pinned` | Pin changed | Re-sort list |
| `chat.message.reaction` | Reaction add/remove | Update reaction row |
| `chat.lock.changed` | Lock toggled | Update composer from settings |
| `chat.settings.changed` | Settings updated | Re-fetch `GET …/settings` |

There is **no** single-message GET; refreshing the list (or patching from events) is the simplest approach.

---

## 8. Data models

### 8.1 Settings — `GetChatSettingsDto`

```json
{
  "courseId": "guid",
  "displayName": "الفيزياء - ميكانيكا الكم",
  "subjectId": 1,
  "subjectNameAr": "الفيزياء",
  "isLocked": false,
  "isTeachersOnly": false,
  "allowAttachments": true,
  "allowImages": true,
  "allowDocuments": true,
  "allowWebLinks": true,
  "allowParentView": false
}
```

### 8.2 Message — `GetChatMessagesDto`

```json
{
  "id": "guid",
  "content": "مرحباً",
  "attachmentUrl": null,
  "replyToMessageId": null,
  "replyToPreview": null,
  "senderId": "guid",
  "senderName": "أحمد",
  "isPinned": false,
  "createdAt": "2026-05-20T10:00:00Z",
  "attachments": [
    {
      "id": "guid",
      "attachmentType": 1,
      "url": "https://api.../uploads/.../img.jpg",
      "fileName": "img.jpg",
      "mimeType": "image/jpeg",
      "sizeInBytes": 102400
    }
  ],
  "reactions": [
    { "emoji": "👍", "count": 2, "reactedByCurrentUser": true }
  ]
}
```

Prefer `attachments[]` over `attachmentUrl` when rendering.

### 8.3 Group details — `GetChatGroupDetailsDto`

```json
{
  "chatGroupId": "guid",
  "courseId": "guid",
  "groupName": "الفيزياء - ميكانيكا الكم",
  "description": "وصف الدورة",
  "coverImageUrl": "https://api.../uploads/.../cover.jpg",
  "subjectId": 1,
  "subjectNameAr": "الفيزياء",
  "gradeId": 10,
  "gradeNameAr": "الصف العاشر",
  "createdAt": "2026-05-01T08:00:00Z",
  "participantsCount": 42,
  "mediaCount": 15,
  "filesCount": 8,
  "isMuted": false,
  "isPinnedInList": true
}
```

### 8.4 Media item — `ChatGroupSharedMediaItemDto`

```json
{
  "id": "attachment-guid",
  "messageId": "message-guid",
  "url": "https://api.../uploads/.../img.jpg",
  "fileName": "photo.jpg",
  "mimeType": "image/jpeg",
  "sizeInBytes": 102400,
  "sharedAt": "2026-05-20T12:00:00Z",
  "senderId": "guid",
  "senderName": "سارة"
}
```

### 8.5 File item — `ChatGroupSharedFileItemDto`

Same shape as media, plus `attachmentType`: `2` (Pdf) or `3` (Ppt).

### 8.6 Participant — `ChatGroupParticipantDto`

```json
{
  "userId": "guid",
  "fullName": "د. محمد",
  "profileImageUrl": "https://api.../uploads/.../avatar.jpg",
  "role": "Teacher",
  "isGroupAdmin": true
}
```

### 8.7 Standard `Result<T>`

```json
{
  "isSuccess": true,
  "statusCode": 200,
  "data": { },
  "message": null,
  "error": { "message": "", "validationErrors": null }
}
```

Check HTTP status, then `isSuccess`, then `error.message`.

---

## 9. Errors

| HTTP | Context | Student UI |
|------|---------|------------|
| 401 | Not logged in | Re-login |
| 403 | `chat access` | Not enrolled in course |
| 403 | `chat locked` | Read-only mode |
| 403 | `teachers only mode` | Hide composer; show banner |
| 403 | `chat message send` | User banned from this chat |
| 400 | Attachments / link not allowed | Toast with `error.message` |
| 404 | Chat or reply message missing | Error / empty state |

Students **cannot** call: delete message, pin message, lock chat, ban, change group settings, or any `/api/v1/admin/chat-groups/*` route (those return `403`).

---

## 10. Endpoint reference (student)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/Chat/{courseId}/settings` | Lock / teachers-only / attachment flags |
| `GET` | `/api/v1/Chat/{courseId}/messages` | Message history (paged) |
| `GET` | `/api/v1/Chat/{courseId}/details` | Group info header |
| `GET` | `/api/v1/Chat/{courseId}/media` | Shared images (paged) |
| `GET` | `/api/v1/Chat/{courseId}/files` | Shared PDF/PPT (paged) |
| `GET` | `/api/v1/Chat/{courseId}/participants` | Teacher + students |
| `PUT` | `/api/v1/Chat/{courseId}/member-preferences` | Mute / pin in list |
| `POST` | `/api/v1/Chat/messages` | Send message |
| `POST` | `/api/v1/Chat/messages/{messageId}/reactions` | Add reaction |
| `DELETE` | `/api/v1/Chat/messages/{messageId}/reactions` | Remove reaction |
| `POST` | `/api/FileUpload/upload` | Upload before send |

**SignalR:** `/hubs/course-chat` — `JoinCourse(courseId)` / `LeaveCourse(courseId)`

---

## 11. Flutter checklist

### Chat tab

- [ ] Verify active enrollment before showing chat
- [ ] `GET settings` → handle 404 gracefully
- [ ] `GET messages` page 1 + infinite scroll (`pageNumber`)
- [ ] SignalR connect + `JoinCourse` on enter; reconnect on resume
- [ ] Disable composer when `isLocked` or `isTeachersOnly`
- [ ] Respect `allowImages` / `allowDocuments` / `allowWebLinks`
- [ ] Send with `attachments[]` only (not `attachmentUrl`)
- [ ] Reply + reactions (emoji body as JSON string)
- [ ] On hub events → refresh list / settings

### Group info screen

- [ ] `GET details` on open
- [ ] Tabs: `GET media` / `GET files` with pagination
- [ ] `GET participants` — show **مدير** when `isGroupAdmin`
- [ ] `PUT member-preferences` on toggle change
- [ ] **Do not** implement leave group

---

*Last updated: May 2026 — student mobile chat (group info, typed attachments, member preferences).*
