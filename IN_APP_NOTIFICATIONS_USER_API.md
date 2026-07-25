# In-App Notifications — User API

**Audience:** Web / mobile (notification bell)  
**Auth:** `Authorization: Bearer {access_token}` (any authenticated user)  
**Base route:** `/api/v1/PushNotifications`

These endpoints power the in-app notification inbox (bell button). They return deliveries stored for the **current user** only.

---

## Endpoint summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/v1/PushNotifications/in-app` | List my in-app notifications (paged) |
| `PATCH` | `/api/v1/PushNotifications/in-app/{id}/read` | Mark one notification as read |

---

## 1. Get my in-app notifications

```http
GET /api/v1/PushNotifications/in-app?pageNumber=1&pageSize=20&unreadOnly=false
Authorization: Bearer {token}
```

### Query parameters

| Name | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `pageNumber` | `int` | No | `1` | Must be `>= 1` |
| `pageSize` | `int` | No | `20` | Must be between `1` and `100` |
| `unreadOnly` | `bool?` | No | `null` | `true` = unread only; omit/`false` = all |

### Behavior

- Scoped to the authenticated user (`UserId` from JWT).
- Newest first (`CreatedAt` descending).
- Joins each inbox row with its broadcast content (`title`, `body`, action CTA).

### Success response (`200`)

`data` is a **JSON array** of items (paged slice):

```json
{
  "isSuccess": true,
  "status": "Success",
  "message": null,
  "data": [
    {
      "id": 42,
      "broadcastNotificationId": 10,
      "title": "عنوان الإشعار",
      "body": "نص الإشعار",
      "actionButtonText": "عرض",
      "actionUrl": "https://app.example.com/path",
      "createdAt": "2026-07-22T18:00:00Z",
      "isRead": false
    },
    {
      "id": 41,
      "broadcastNotificationId": 9,
      "title": "إشعار سابق",
      "body": "…",
      "actionButtonText": null,
      "actionUrl": null,
      "createdAt": "2026-07-21T10:00:00Z",
      "isRead": true
    }
  ]
}
```

### Item fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `long` | **Inbox row id** — use this for mark-as-read |
| `broadcastNotificationId` | `long` | Source broadcast id |
| `title` | `string` | Notification title |
| `body` | `string` | Notification body |
| `actionButtonText` | `string?` | Optional CTA label |
| `actionUrl` | `string?` | Optional deep link / URL |
| `createdAt` | `datetime` | When delivered to the user |
| `isRead` | `bool` | `true` if already marked read |

### Errors

| Status | When |
|--------|------|
| `400` | Invalid `pageNumber` / `pageSize` |
| `401` | Missing or invalid token |

### Bell UI tips

- Load page 1 when opening the notifications panel.
- Badge / unread filter: `unreadOnly=true`.
- Use `id` (not `broadcastNotificationId`) when calling mark-as-read.
- If `data.length < pageSize`, there is likely no next page.

---

## 2. Mark notification as read

```http
PATCH /api/v1/PushNotifications/in-app/{id}/read
Authorization: Bearer {token}
```

### Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `long` | Yes | Inbox notification `id` from the list endpoint |

No request body.

### Behavior

- Finds the row where `id` matches **and** it belongs to the current user.
- If unread, sets `ReadAt` to UTC now.
- If already read, still returns success (idempotent).

### Success response (`200`)

```json
{
  "isSuccess": true,
  "status": "Success",
  "message": null,
  "data": {}
}
```

### Errors

| Status | When |
|--------|------|
| `401` | Missing or invalid token |
| `404` | Notification not found for this user |

---

## Suggested UI flow

```text
User taps notifications bell
  └─ GET /api/v1/PushNotifications/in-app?pageNumber=1&pageSize=20
       ├─ Render list (title, body, createdAt, isRead)
       ├─ Optional: unreadOnly=true for unread tab
       └─ User opens / taps an item
            └─ PATCH /api/v1/PushNotifications/in-app/{id}/read
                 └─ Update local item isRead = true
```

---

## Notes

- Device token registration (`POST /api/v1/PushNotifications/device`) is separate — used for **push** delivery, not for listing the inbox.
- Admin broadcast/send APIs live under `/api/v1/admin/PushNotifications`.
