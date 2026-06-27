import { CourseAccessType } from "@/shared/domain/enums/course.enums";
import type { CourseDetailsModel } from "@/shared/domain/types/course.types";

export function formatCoursePrice(
  course: Pick<
    CourseDetailsModel,
    "accessType" | "originalPrice" | "discountedPrice" | "currency"
  >,
  locale: string,
  freeLabel: string,
): { current: string; original: string | null; hasDiscount: boolean } {
  if (course.accessType === CourseAccessType.Free) {
    return { current: freeLabel, original: null, hasDiscount: false };
  }

  const price =
    course.discountedPrice > 0 ? course.discountedPrice : course.originalPrice;
  const formatter = new Intl.NumberFormat(locale.startsWith("ar") ? "ar-EG" : "en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const formatted = formatter.format(price);
  const currency = course.currency?.trim();
  const current = locale.startsWith("ar")
    ? currency
      ? `${formatted} ${currency}`
      : `${formatted} ج.م`
    : currency
      ? `${currency} ${formatted}`
      : `EGP ${formatted}`;

  const hasDiscount =
    course.discountedPrice > 0 && course.originalPrice > course.discountedPrice;
  const original = hasDiscount
    ? locale.startsWith("ar")
      ? `${formatter.format(course.originalPrice)} ${currency || "ج.م"}`
      : `${currency || "EGP"} ${formatter.format(course.originalPrice)}`
    : null;

  return { current, original, hasDiscount };
}
