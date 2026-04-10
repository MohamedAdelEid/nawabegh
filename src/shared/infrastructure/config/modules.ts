import { studentModule } from "@/modules/student/module.config";
import { adminModule } from "@/modules/admin/module.config";

export const appModules = [
  studentModule,
  adminModule,
] as const;

export const allI18nNamespaces = appModules.flatMap((m) => m.i18nNamespaces);
