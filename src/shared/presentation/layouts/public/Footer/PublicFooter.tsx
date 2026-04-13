import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { PublicFooterCategoryLinks } from "./PublicFooterCategoryLinks";
import { PublicFooterQuickSearch } from "./PublicFooterQuickSearch";

export function PublicFooter() {
  return (
    <footer className="bg-[#002d27] text-white" dir="rtl">
      <div className="container py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-4 md:gap-12">
          {/* Brand / description - right column */}
          <div className="space-y-4 text-right">
            <div className="relative w-14 h-14 sm:h-20 sm:w-20">
              <Image
                src="/assets/images/logos/main_logo.png"
                alt="شعار منصة مدارج السالكين"
                fill
                className="object-contain"
                sizes="190px"
                priority
              />
            </div>
            <p className="text-sm leading-relaxed text-white/80">
              منصة القراءة والتعلم الرقميّة المتخصصة في تقديم المحتوى العلمي
              والشرعي بأعلى معايير الجودة والأسلوب.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-4 text-right">
            <div>
              <h3 className="text-sm font-semibold text-white">روابط سريعة</h3>
              <p className="mt-1 text-xs text-white/60">
                وصول مباشر إلى أهم صفحات المنصة.
              </p>
            </div>
            <ul className="space-y-1.5 text-sm text-white/80">
              {[
                { label: "الرئيسية", href: "/" },
                { label: "المكتبة", href: "/library" },
                { label: "عن المنصة", href: "/about-platform" },
                { label: "المؤلف", href: "/author" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="group inline-flex w-full items-center gap-2 text-white/80 transition-colors duration-200 hover:text-white"
                  >
                    <ChevronLeft className="h-3 w-3" />
                    <span className="relative text-sm">
                      {item.label}
                      <span className="absolute bottom-0 right-0 h-px w-0 bg-white/70 transition-all duration-300 ease-out group-hover:w-full" />
                    </span>
                    <span className="flex h-4 w-4 items-center justify-center text-white/70 transition-transform duration-300 ease-out group-hover:-translate-x-0.5">
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Main categories */}
          <div className="space-y-4 text-right">
            <div>
              <h3 className="text-sm font-semibold text-white">
                الفئات الرئيسية
              </h3>
              <p className="mt-1 text-xs text-white/60">
                تصفح أبرز الأقسام العلمية في المكتبة.
              </p>
            </div>
            <PublicFooterCategoryLinks />
          </div>

          {/* Quick search */}
          <div className="space-y-4 text-right">
            <div>
              <h3 className="text-sm font-semibold text-white">
                بحث سريع في المكتبة
              </h3>
              <p className="mt-1 text-xs text-white/60">
                ابحث عن الكتب، الأقسام، أو المؤلفين مباشرة.
              </p>
            </div>
            <PublicFooterQuickSearch />
            <p className="text-xs leading-relaxed text-white/75">
              استخدم البحث السريع للوصول إلى المؤلفات، الأقسام، والكتب المفضلة
              مباشرة.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-white/15 pt-4">
          <div className="flex flex-col items-center justify-between gap-2 text-xs text-white/70 md:flex-row">
            <div className="flex gap-4">
              <Link
                href="/privacy"
                className="transition-colors duration-200 hover:text-white"
              >
                سياسة الخصوصية
              </Link>
              <Link
                href="/terms"
                className="transition-colors duration-200 hover:text-white"
              >
                الشروط والأحكام
              </Link>
            </div>
            <p>جميع الحقوق محفوظة لمنصة مختصرات ابن القيم © 2026</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

