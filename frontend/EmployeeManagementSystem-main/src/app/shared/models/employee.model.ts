export interface Employee {
  employeeId: number;
  employeeCode: string;
  fullName: string;
  email: string;
  department: string;
  designation: string;
  joiningDate: string;
  activeStatus: boolean;
}

export interface CreateEmployeeRequest {
  employeeCode: string;
  fullName: string;
  email: string;
  department: string;
  designation: string;
  joiningDate: string;
  activeStatus: boolean;
}

export interface UpdateEmployeeRequest {
  employeeCode: string;
  fullName: string;
  email: string;
  department: string;
  designation: string;
  joiningDate: string;
  activeStatus: boolean;
}

export const DEPARTMENTS: string[] = [
  'Human Resources',
  'Information Technology',
  'Finance',
  'Marketing',
  'Sales',
  'Operations'
];