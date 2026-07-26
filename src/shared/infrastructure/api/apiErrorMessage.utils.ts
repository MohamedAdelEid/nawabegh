/**
 * Normalize API / ASP.NET validation messages for UI display (prefer Arabic).
 */

const FIELD_LABELS_AR: Record<string, string> = {
  fullname: "الاسم الكامل",
  name: "الاسم",
  email: "البريد الإلكتروني",
  password: "كلمة المرور",
  phonenumber: "رقم الجوال",
  phonecountrycode: "رمز الدولة",
  countryid: "الدولة",
  address: "العنوان",
  username: "اسم المستخدم",
  jobtitle: "المسمى الوظيفي",
  schoolname: "اسم المدرسة",
  educationlevelid: "المستوى التعليمي",
  gradeid: "الصف",
  schoolid: "المدرسة",
  whatsappnumber: "رقم الواتساب",
  whatsappcountrycode: "رمز واتساب",
  confirmpassword: "تأكيد كلمة المرور",
};

const EXACT_MESSAGE_AR: Record<string, string> = {
  "one or more validation errors occurred.": "حدث خطأ أو أكثر في التحقق من البيانات.",
  "a non-empty request body is required.": "يجب إرسال بيانات الطلب.",
};

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

function fieldLabelAr(propertyName: string): string {
  const key = normalizeKey(propertyName);
  return FIELD_LABELS_AR[key] ?? propertyName;
}

/** Translate common English ASP.NET / FluentValidation messages to Arabic. */
export function localizeValidationMessage(message: string, propertyName?: string): string {
  const trimmed = message.trim();
  if (!trimmed) return trimmed;

  // Already Arabic (basic heuristic)
  if (/[\u0600-\u06FF]/.test(trimmed)) return trimmed;

  const lower = trimmed.toLowerCase();
  if (EXACT_MESSAGE_AR[lower]) return EXACT_MESSAGE_AR[lower];

  const label = propertyName ? fieldLabelAr(propertyName) : null;

  const requiredMatch = trimmed.match(/^The\s+(.+?)\s+field is required\.?$/i);
  if (requiredMatch?.[1]) {
    return `حقل ${fieldLabelAr(requiredMatch[1])} مطلوب.`;
  }

  if (/is required\.?$/i.test(trimmed) && label) {
    return `حقل ${label} مطلوب.`;
  }

  const notValidMatch = trimmed.match(/^The\s+(.+?)\s+field is not (a )?valid\.?$/i);
  if (notValidMatch?.[1]) {
    return `حقل ${fieldLabelAr(notValidMatch[1])} غير صالح.`;
  }

  if (/must be a string.*minimum length of\s+(\d+)/i.test(trimmed)) {
    const min = trimmed.match(/minimum length of\s+(\d+)/i)?.[1];
    return label
      ? `حقل ${label} يجب ألا يقل عن ${min} أحرف.`
      : `يجب ألا يقل النص عن ${min} أحرف.`;
  }

  if (/must be a string.*maximum length of\s+(\d+)/i.test(trimmed)) {
    const max = trimmed.match(/maximum length of\s+(\d+)/i)?.[1];
    return label
      ? `حقل ${label} يجب ألا يزيد عن ${max} أحرف.`
      : `يجب ألا يزيد النص عن ${max} أحرف.`;
  }

  if (/is not a valid e-?mail/i.test(trimmed) || /invalid email/i.test(trimmed)) {
    return "أدخل بريداً إلكترونياً صالحاً.";
  }

  if (/password/i.test(trimmed) && /too short|at least|minimum/i.test(trimmed)) {
    return "كلمة المرور قصيرة جداً.";
  }

  if (/already exists|is already taken|duplicate/i.test(trimmed)) {
    if (label) return `${label} مستخدم مسبقاً.`;
    return "هذه البيانات مستخدمة مسبقاً.";
  }

  if (/unauthorized|access denied/i.test(trimmed)) {
    return "غير مصرح لك بتنفيذ هذا الإجراء.";
  }

  if (/not found/i.test(trimmed)) {
    return "العنصر المطلوب غير موجود.";
  }

  // Generic "The X field ..." leftovers
  const theFieldMatch = trimmed.match(/^The\s+([A-Za-z0-9_.]+)\s+field\s+(.+)$/i);
  if (theFieldMatch?.[1] && theFieldMatch[2]) {
    return `حقل ${fieldLabelAr(theFieldMatch[1])}: ${theFieldMatch[2]}`;
  }

  return trimmed;
}

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value != null && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function readString(record: UnknownRecord | null, keys: string[]): string | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

/** Collect raw validation messages with optional property names from any API error body. */
export function collectValidationMessages(body: unknown): Array<{ property?: string; message: string }> {
  const root = asRecord(body);
  if (!root) return [];

  const collected: Array<{ property?: string; message: string }> = [];

  const pushMessage = (message: unknown, property?: string) => {
    if (typeof message !== "string" || !message.trim()) return;
    collected.push({ property, message: message.trim() });
  };

  // ASP.NET ProblemDetails: { errors: { Field: ["msg"] } }
  const problemErrors = asRecord(root.errors);
  if (problemErrors) {
    for (const [property, value] of Object.entries(problemErrors)) {
      if (Array.isArray(value)) {
        for (const item of value) pushMessage(item, property);
      } else {
        pushMessage(value, property);
      }
    }
  }

  // Backend envelope: error.validationErrors as array or dictionary
  const errorObj = asRecord(root.error);
  const validationErrors = errorObj?.validationErrors ?? root.validationErrors;

  if (Array.isArray(validationErrors)) {
    for (const item of validationErrors) {
      const record = asRecord(item);
      if (!record) continue;
      pushMessage(
        record.errorMessage ?? record.message ?? record.messageAr,
        typeof record.propertyName === "string" ? record.propertyName : undefined,
      );
    }
  } else {
    const dict = asRecord(validationErrors);
    if (dict) {
      for (const [property, value] of Object.entries(dict)) {
        if (Array.isArray(value)) {
          for (const item of value) pushMessage(item, property);
        } else {
          pushMessage(value, property);
        }
      }
    }
  }

  // Nested details array
  const details = errorObj?.details ?? root.details;
  if (Array.isArray(details)) {
    for (const item of details) {
      if (typeof item === "string") pushMessage(item);
      else {
        const record = asRecord(item);
        if (record) {
          pushMessage(
            record.messageAr ?? record.message ?? record.errorMessage,
            typeof record.propertyName === "string" ? record.propertyName : undefined,
          );
        }
      }
    }
  }

  return collected;
}

export function resolveApiErrorMessage(body: unknown, fallback: string): string {
  const root = asRecord(body);

  // Prefer explicit Arabic message first
  const arabicDirect =
    readString(asRecord(root?.error), ["messageAr"]) ??
    readString(root, ["messageAr"]);
  if (arabicDirect) return arabicDirect;

  const validations = collectValidationMessages(body);
  if (validations.length > 0) {
    return validations
      .map(({ property, message }) => localizeValidationMessage(message, property))
      .join("\n");
  }

  const direct =
    readString(asRecord(root?.error), ["message"]) ??
    readString(root, ["message"]);
  if (direct) return localizeValidationMessage(direct);

  const title = readString(root, ["title"]);
  if (title) {
    const localizedTitle = localizeValidationMessage(title);
    // Skip generic English ProblemDetails title if we have nothing better — still localize it
    if (localizedTitle) return localizedTitle;
  }

  return fallback;
}
