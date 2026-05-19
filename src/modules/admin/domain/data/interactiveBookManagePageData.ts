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

/** Empty defaults for the manage page create flow (no mock book data). */
export const emptyInteractiveBookManagePageData: InteractiveBookManagePageData = {
  subjectSelectValue: "",
  pdfFileName: "",
  currentPage: 1,
  totalPages: 1,
  points: [],
};

/** @deprecated Use `emptyInteractiveBookManagePageData` for create; edit mode uses API data. */
export const interactiveBookManagePageData: InteractiveBookManagePageData = {
  ...emptyInteractiveBookManagePageData,
};
