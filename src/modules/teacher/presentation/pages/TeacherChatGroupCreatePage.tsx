"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/infrastructure/config/routes";

export function TeacherChatGroupCreatePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTES.USER.TEACHER.CHAT_GROUPS.LIST);
  }, [router]);

  return null;
}
