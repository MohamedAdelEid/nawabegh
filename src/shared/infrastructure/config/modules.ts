import { studentModule } from "@/modules/student/module.config";
import { adminModule } from "@/modules/admin/module.config";
import { authModule } from "@/modules/auth/module.config";

export const appModules = [
  authModule,
  studentModule,
  adminModule,
] as const;

export const allI18nNamespaces = appModules.flatMap((m) => m.i18nNamespaces);
