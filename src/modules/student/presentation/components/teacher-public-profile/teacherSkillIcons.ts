"use client";

import {
  Atom,
  Beaker,
  BookOpen,
  Brain,
  FlaskConical,
  GraduationCap,
  Lightbulb,
  Microscope,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const SKILL_ICONS: LucideIcon[] = [
  Atom,
  Beaker,
  BookOpen,
  Brain,
  FlaskConical,
  GraduationCap,
  Lightbulb,
  Microscope,
  Sparkles,
];

export function getTeacherSkillIcon(index: number): LucideIcon {
  return SKILL_ICONS[index % SKILL_ICONS.length] ?? Lightbulb;
}
