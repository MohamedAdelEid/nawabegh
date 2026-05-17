export interface InteractiveBookManagePoint {
  id: string;
  titleKey: string;
  pageLabelKey: string;
  typeKey: string;
  visible: boolean;
}

export interface InteractiveBookManagePageData {
  subjectSelectValue: string;
  pdfFileName: string;
  currentPage: number;
  totalPages: number;
  points: InteractiveBookManagePoint[];
}

export const interactiveBookManagePageData: InteractiveBookManagePageData = {
  subjectSelectValue: "chemistry-grade2",
  pdfFileName: "chemistry_basics_v2.pdf",
  currentPage: 42,
  totalPages: 156,
  points: [
    {
      id: "p1",
      titleKey: "interactiveBooks.managePage.points.items.polarBond.title",
      pageLabelKey: "interactiveBooks.managePage.points.items.polarBond.page",
      typeKey: "interactiveBooks.managePage.points.type.video",
      visible: true,
    },
    {
      id: "p2",
      titleKey: "interactiveBooks.managePage.points.items.polarBond.title",
      pageLabelKey: "interactiveBooks.managePage.points.items.polarBond.page",
      typeKey: "interactiveBooks.managePage.points.type.video",
      visible: true,
    },
  ],
};

export const interactiveBookManageSubjectOptions = [
  { id: "chemistry-grade2", labelKey: "interactiveBooks.managePage.config.subjectOptions.chemistryGrade2" },
] as const;
