// Type definitions for the MatrSphere Profile System

export interface UserPublic {
  id: number;
  name: string;
  education: string | null;
  address: string | null;
  email_id: string;
  gender: string | null;
  department: string | null;
  project: string | null;
  location: string | null;
  created_at: string | null;
}

export interface UserUnmasked extends UserPublic {
  contact_number: string | null;
  account_number: string | null;
  government_id: string | null;
}

export interface ApiError {
  detail: string;
}

export interface ConsentRequest {
  consent_given: boolean;
}
