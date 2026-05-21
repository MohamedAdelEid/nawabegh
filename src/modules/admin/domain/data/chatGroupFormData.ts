import type {
  ChatGroupFormValues,
  ChatGroupEditData,
  ChatGroupGradeId,
  ChatGroupSubjectId,
} from "../types/chatGroups.types";

export type ChatGroupTeacherOption = {
  id: string;
  name: string;
  subject?: string;
};

export type ChatGroupSubjectOption = {
  id: ChatGroupSubjectId;
  labelKey: string;
};

export type ChatGroupGradeOption = {
  id: ChatGroupGradeId;
  labelKey: string;
};

export const chatGroupTeacherOptions: ChatGroupTeacherOption[] = [
  { id: "t1", name: "أ. محمد أحمد (كيميا)", subject: "chemistry" },
  { id: "t2", name: "أ. فاطمة علي (رياضيات)", subject: "math" },
  { id: "t3", name: "أ. أحمد محمود (فيزياء)", subject: "physics" },
  { id: "t4", name: "أ. سارة حسن (لغة عربية)", subject: "arabic" },
  { id: "t5", name: "أ. خالد عمر (لغة إنجليزية)", subject: "english" },
];

export const chatGroupSubjectOptions: ChatGroupSubjectOption[] = [
  { id: "arabic", labelKey: "chatGroups.subjects.arabic" },
  { id: "english", labelKey: "chatGroups.subjects.english" },
  { id: "math", labelKey: "chatGroups.subjects.math" },
  { id: "science", labelKey: "chatGroups.subjects.science" },
  { id: "physics", labelKey: "chatGroups.subjects.physics" },
  { id: "chemistry", labelKey: "chatGroups.subjects.chemistry" },
  { id: "biology", labelKey: "chatGroups.subjects.biology" },
  { id: "history", labelKey: "chatGroups.subjects.history" },
  { id: "geography", labelKey: "chatGroups.subjects.geography" },
];

export const chatGroupGradeOptions: ChatGroupGradeOption[] = [
  { id: "grade1", labelKey: "chatGroups.grades.grade1" },
  { id: "grade2", labelKey: "chatGroups.grades.grade2" },
  { id: "grade3", labelKey: "chatGroups.grades.grade3" },
  { id: "grade4", labelKey: "chatGroups.grades.grade4" },
  { id: "grade5", labelKey: "chatGroups.grades.grade5" },
  { id: "grade6", labelKey: "chatGroups.grades.grade6" },
  { id: "grade7", labelKey: "chatGroups.grades.grade7" },
  { id: "grade8", labelKey: "chatGroups.grades.grade8" },
  { id: "grade9", labelKey: "chatGroups.grades.grade9" },
  { id: "grade10", labelKey: "chatGroups.grades.grade10" },
  { id: "grade11", labelKey: "chatGroups.grades.grade11" },
  { id: "grade12", labelKey: "chatGroups.grades.grade12" },
];

export const defaultChatGroupFormValues: ChatGroupFormValues = {
  chatGroupId: "",
  courseId: "",
  groupName: "",
  subjectDisplayName: "",
  gradeDisplayName: "",
  subjectId: "",
  gradeId: "",
  description: "",
  teacherId: "",
  chatModeId: "everyone",
  mediaPermissions: {
    allowFiles: true,
    allowImages: true,
    allowPdf: true,
    allowWebLinks: false,
  },
  blockAttachments: false,
  isLocked: false,
  linkedCourseDraftUrl: "",
  linkedCourses: [],
  parentViewOnly: false,
  groupImageFile: null,
  groupImagePreviewUrl: "",
};

export const sampleChatGroupEditData: ChatGroupEditData = {
  id: "chem-12",
  chatGroupId: "chem-12",
  courseId: "chem-12",
  groupName: "كيمياء - الصف الثاني عشر (أ)",
  subjectDisplayName: "الكيمياء",
  gradeDisplayName: "الصف الثاني عشر",
  subjectId: "chemistry",
  gradeId: "grade12",
  description:
    "مجموعة مخصصة لمناقشة دروس الكيمياء العضوية والتحليلية للفصل الدراسي الأول. يرجى الالتزام بالقواعد الأكاديمية.",
  teacherId: "t1",
  chatModeId: "everyone",
  mediaPermissions: {
    allowFiles: true,
    allowImages: true,
    allowPdf: false,
    allowWebLinks: false,
  },
  blockAttachments: false,
  linkedCourseDraftUrl: "",
  linkedCourses: [
    {
      id: "sample-course-1",
      url: "my.scholar.com/courses/chemistry-12",
      name: "أساسيات الكيمياء التحليلية",
    },
  ],
  parentViewOnly: true,
  isLocked: false,
  groupImageFile: null,
  groupImagePreviewUrl: "",
};
