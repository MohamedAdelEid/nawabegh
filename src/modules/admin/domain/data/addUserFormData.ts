import {
  GraduationCap,
  School2,
  Users,
} from "lucide-react";
import type {
  AddUserCountryId,
  AddUserGradeLevelId,
  AddUserLinkedEntity,
  AddUserOption,
  AddUserPermissionId,
  AddUserPickerOption,
  AddUserSchoolYearId,
  AddUserStageId,
  AddUserSubjectId,
  AddUserSubscriptionPlanId,
  ParentAccountFormValues,
  StudentAccountFormValues,
  TeacherAccountFormValues,
} from "@/modules/admin/domain/types/addUser.types";
import type { SidebarIcon } from "@/shared/domain/types/sidebar.types";
import Cap from "../../presentation/assets/icons/Cap";
import PersonLocation from "../../presentation/assets/icons/PersonLocation";
import Parents from "../../presentation/assets/icons/Parents";

export interface AddUserPickerCard extends AddUserPickerOption {
  icon: SidebarIcon;
}

export const addUserPickerCards: AddUserPickerCard[] = [
  {
    id: "student",
    titleKey: "userManagement.addUser.modal.options.student.title",
    descriptionKey: "userManagement.addUser.modal.options.student.description",
    accentTone: "primary",
    icon: Cap,
  },
  {
    id: "teacher",
    titleKey: "userManagement.addUser.modal.options.teacher.title",
    descriptionKey: "userManagement.addUser.modal.options.teacher.description",
    accentTone: "success",
    icon: PersonLocation,
  },
  {
    id: "parent",
    titleKey: "userManagement.addUser.modal.options.parent.title",
    descriptionKey: "userManagement.addUser.modal.options.parent.description",
    accentTone: "warning",
    icon: Parents,
  },
];

export const addUserCountryOptions: AddUserOption<AddUserCountryId>[] = [
  { id: "egypt", labelKey: "userManagement.addUser.shared.countries.egypt" },
  { id: "saudi", labelKey: "userManagement.addUser.shared.countries.saudi" },
];

export const addUserStageOptions: AddUserOption<AddUserStageId>[] = [
  { id: "primary", labelKey: "userManagement.addUser.shared.stages.primary" },
  { id: "middle", labelKey: "userManagement.addUser.shared.stages.middle" },
  { id: "secondary", labelKey: "userManagement.addUser.shared.stages.secondary" },
];

export const addUserSchoolYearOptions: AddUserOption<AddUserSchoolYearId>[] = [
  { id: "year1", labelKey: "userManagement.addUser.shared.schoolYears.year1" },
  { id: "year2", labelKey: "userManagement.addUser.shared.schoolYears.year2" },
  { id: "year3", labelKey: "userManagement.addUser.shared.schoolYears.year3" },
];

export const addUserSubscriptionOptions: AddUserOption<AddUserSubscriptionPlanId>[] =
  [
    {
      id: "trial",
      labelKey: "userManagement.addUser.shared.subscription.trial.title",
      descriptionKey: "userManagement.addUser.shared.subscription.trial.description",
    },
    {
      id: "active",
      labelKey: "userManagement.addUser.shared.subscription.active.title",
      descriptionKey: "userManagement.addUser.shared.subscription.active.description",
    },
    {
      id: "none",
      labelKey: "userManagement.addUser.shared.subscription.none.title",
      descriptionKey: "userManagement.addUser.shared.subscription.none.description",
    },
  ];

export const addUserSubjectOptions: AddUserOption<AddUserSubjectId>[] = [
  { id: "arabic", labelKey: "userManagement.addUser.teacher.subjects.arabic" },
  { id: "science", labelKey: "userManagement.addUser.teacher.subjects.science" },
  { id: "math", labelKey: "userManagement.addUser.teacher.subjects.math" },
];

export const addUserGradeLevelOptions: AddUserOption<AddUserGradeLevelId>[] = [
  { id: "first", labelKey: "userManagement.addUser.teacher.gradeLevels.first" },
  { id: "second", labelKey: "userManagement.addUser.teacher.gradeLevels.second" },
  { id: "third", labelKey: "userManagement.addUser.teacher.gradeLevels.third" },
  { id: "fourth", labelKey: "userManagement.addUser.teacher.gradeLevels.fourth" },
  { id: "fifth", labelKey: "userManagement.addUser.teacher.gradeLevels.fifth" },
  { id: "sixth", labelKey: "userManagement.addUser.teacher.gradeLevels.sixth" },
];

export const addUserPermissionOptions: AddUserOption<AddUserPermissionId>[] = [
  {
    id: "createLessons",
    labelKey: "userManagement.addUser.teacher.permissions.createLessons.title",
    descriptionKey:
      "userManagement.addUser.teacher.permissions.createLessons.description",
  },
  {
    id: "liveBroadcast",
    labelKey: "userManagement.addUser.teacher.permissions.liveBroadcast.title",
    descriptionKey:
      "userManagement.addUser.teacher.permissions.liveBroadcast.description",
  },
  {
    id: "uploadFiles",
    labelKey: "userManagement.addUser.teacher.permissions.uploadFiles.title",
    descriptionKey:
      "userManagement.addUser.teacher.permissions.uploadFiles.description",
  },
  {
    id: "addTests",
    labelKey: "userManagement.addUser.teacher.permissions.addTests.title",
    descriptionKey:
      "userManagement.addUser.teacher.permissions.addTests.description",
  },
  {
    id: "manageChats",
    labelKey: "userManagement.addUser.teacher.permissions.manageChats.title",
    descriptionKey:
      "userManagement.addUser.teacher.permissions.manageChats.description",
  },
];

export const availableParentOptions: AddUserLinkedEntity[] = [
  {
    id: "parent-1",
    name: "أحمد محمد",
    secondaryLabel: "رقم الهاتف: +966 50 123 4567",
    tertiaryLabel: "ولي أمر مسجل مسبقاً",
    avatarInitials: "أم",
    avatarClassName: "bg-[#FDEDD4] text-[#9A5B18]",
  },
];

export const availableStudentOptions: AddUserLinkedEntity[] = [
  {
    id: "student-1",
    name: "ياسين أحمد محمد",
    secondaryLabel: "رقم أكاديمي: ID-99283#",
    tertiaryLabel: "الصف الخامس",
    avatarInitials: "يم",
    avatarClassName: "bg-[#DBEEF6] text-[#255E8A]",
  },
  {
    id: "student-2",
    name: "ليلى أحمد محمد",
    secondaryLabel: "رقم أكاديمي: ID-99285#",
    tertiaryLabel: "الصف الثالث",
    avatarInitials: "لم",
    avatarClassName: "bg-[#FEE2E2] text-[#B42318]",
  },
];

export const defaultStudentAccountValues: StudentAccountFormValues = {
  fullName: "",
  countryId: "egypt",
  educationalStageId: "middle",
  schoolYearId: "year1",
  phoneNumber: "",
  schoolName: "",
  email: "",
  password: "",
  avatarFile: null,
  avatarPreviewUrl: null,
  linkParentEnabled: true,
  parentSearch: "",
  selectedParentId: null,
  subscriptionPlanId: "trial",
  subscriptionStartDate: "10/25/2023",
  subscriptionEndDate: "10/25/2026",
};

export const defaultTeacherAccountValues: TeacherAccountFormValues = {
  fullName: "",
  phoneNumber: "",
  countryId: "egypt",
  jobTitle: "",
  schoolName: "",
  password: "",
  address: "",
  avatarFile: null,
  avatarPreviewUrl: null,
  subjectIds: ["arabic", "math"],
  gradeLevelIds: ["first", "third", "sixth"],
  permissionIds: ["createLessons", "liveBroadcast", "uploadFiles"],
};

export const defaultParentAccountValues: ParentAccountFormValues = {
  fullName: "",
  phoneNumber: "",
  countryId: "egypt",
  address: "",
  email: "",
  password: "",
  avatarFile: null,
  avatarPreviewUrl: null,
  studentSearch: "",
  selectedStudentIds: availableStudentOptions.map((student) => student.id),
};
