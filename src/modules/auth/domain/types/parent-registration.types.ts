export type ParentRegistrationRequest = {
  fullName: string;
  countryId: number;
  email: string;
  password: string;
  phoneNumber: string;
  phoneCountryCode: number;
  address: string;
};

export type ParentRegistrationResponse = {
  success: boolean;
  message?: string;
};
