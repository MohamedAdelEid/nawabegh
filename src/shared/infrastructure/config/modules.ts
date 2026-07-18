import { studentModule } from "@/modules/student/module.config";
import { adminModule } from "@/modules/admin/module.config";
import { authModule } from "@/modules/auth/module.config";
import { teacherModule } from "@/modules/teacher/module.config";
import { schoolModule } from "@/modules/school/module.config";
import { parentModule } from "@/modules/parent/module.config";

export const appModules = [
  authModule,
  studentModule,
  adminModule,
  teacherModule,
  schoolModule,
  parentModule,
] as const;

export const allI18nNamespaces = appModules.flatMap((m) => m.i18nNamespaces);
