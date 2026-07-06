export type AccountTypeId = "student" | "teacher" | "parent" | "school";

export type AccountTypeOption = {
  id: AccountTypeId;
  iconSrc: string;
  iconBgClass: string;
  supportsRegistration: boolean;
};
