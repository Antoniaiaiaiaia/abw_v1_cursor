export interface User {
  id: string;
  email: string;
  name: string;
  companyEmail?: string;
  companyEmailVerified: boolean;
  companyEmailStatus: 'pending' | 'pass' | 'no';
  avatar?: string;
  user_metadata?: {
    name?: string;
  };
}

