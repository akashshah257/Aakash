export type View = 'employees' | 'collage';

export interface Employee {
  id: string;
  name: string;
  phone: string;
  dailyWage: number;
}

export interface Attendance {
  employeeId: string;
  date: string; // YYYY-MM-DD in BS
  status: 'present' | 'absent';
}

export interface Advance {
  id: string;
  employeeId: string;
  amount: number;
  date: string; // YYYY-MM-DD in BS
}

export interface CollageRecord {
  id: string;
  sn: number;
  collageName: string;
  studentName: string;
  mobile: string;
  totalAmount: number;
  deliveryStatus: 'yes' | 'no';
  deliveryDate: string; // YYYY-MM-DD in BS
}