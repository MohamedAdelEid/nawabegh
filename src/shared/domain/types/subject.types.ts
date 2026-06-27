export type SubjectDto = {
  id: number;
  nameAr: string;
  nameEn: string;
  iconUrl: string;
  coursesCount: number;
  teachersCount: number;
  createdAt: string;
};

export type Subject = {
  id: number;
  nameAr: string;
  nameEn: string;
  iconUrl: string | null;
  coursesCount: number;
  teachersCount: number;
};
