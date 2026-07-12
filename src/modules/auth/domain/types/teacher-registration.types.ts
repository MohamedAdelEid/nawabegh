export type TeacherRegistrationRequest = {
  jobTitle: string;
  schoolName: string;
  countryId: number;
  email: string;
  password: string;
  passwordConfirm: string;
  phoneNumber: string;
  phoneCountryCode: number;
  address: string;
};

export type TeacherRegistrationResponse = {
  success: boolean;
  message?: string;
};
