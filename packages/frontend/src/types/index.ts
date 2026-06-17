export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'RIDER' | 'COMPANY';
  profileImage?: string;
  bio?: string;
  vehicleType?: string;
  experience?: number;
  regions?: string;
  licenseVerified?: boolean;
  companyName?: string;
  businessNumber?: string;
  companyAddress?: string;
  createdAt: string;
}

export interface JobPosting {
  id: string;
  companyId: string;
  company?: User;
  title: string;
  description: string;
  cardType: string;
  region: string;
  regionDetail?: string;
  dailyCount: number;
  payType: string;
  payAmount: number;
  startDate: string;
  endDate?: string;
  workDays?: string;
  workStartTime?: string;
  workEndTime?: string;
  vehicleType?: string;
  status: string;
  isUrgent: boolean;
  createdAt: string;
  _count?: { applications: number };
}

export interface Application {
  id: string;
  jobId: string;
  job?: JobPosting;
  riderId: string;
  rider?: User;
  message?: string;
  status: string;
  appliedAt: string;
  respondedAt?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}
