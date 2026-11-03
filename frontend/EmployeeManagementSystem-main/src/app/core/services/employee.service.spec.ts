
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { EmployeeService } from './employee.service';

import {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest
} from '../../shared/models/employee.model';

import { environment } from '../../../environments/environment';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/Employees`;

  const mockEmployees: Employee[] = [
    {
      employeeId: 1,
      employeeCode: 'EMP001',
      fullName: 'John Doe',
      email: 'john.doe@company.com',
      department: 'Information Technology',
      designation: 'Senior Software Engineer',
      joiningDate: '2023-01-15',
      activeStatus: true
    },
    {
      employeeId: 2,
      employeeCode: 'EMP002',
      fullName: 'Sarah Jenkins',
      email: 'sarah.j@company.com',
      department: 'Human Resources',
      designation: 'HR Specialist',
      joiningDate: '2023-05-20',
      activeStatus: false
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EmployeeService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(EmployeeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // Test 1: Service Creation
  it('Service creation => EmployeeService is created successfully.', () => {
    expect(service).toBeTruthy();

    console.log(
      'Test 1 => PASS: Service creation => EmployeeService is created successfully.'
    );
  });

  // Test 2: Get All Employees
  it('Get all employees => GET request returns the employee list.', () => {
    service.getEmployees().subscribe((employees: Employee[]) => {
      expect(employees.length).toBe(2);
      expect(employees).toEqual(mockEmployees);

      console.log(
        'Test 2 => PASS: Get all employees => GET request returns the employee list.'
      );
    });

    const req = httpMock.expectOne(apiUrl);

    expect(req.request.method).toBe('GET');

    req.flush(mockEmployees);
  });

  // Test 3: Get Employee By ID
  it('Get employee by ID => GET request returns employee details.', () => {
    const singleEmp: Employee = mockEmployees[0];

    service.getEmployeeById(1).subscribe((emp: Employee) => {
      expect(emp).toEqual(singleEmp);
      expect(emp.employeeCode).toBe('EMP001');

      console.log(
        'Test 3 => PASS: Get employee by ID => GET request returns employee details.'
      );
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);

    expect(req.request.method).toBe('GET');

    req.flush(singleEmp);
  });

  // Test 4: Create Employee
  it('Create employee => POST request sends employee data.', () => {
    const newEmployee: CreateEmployeeRequest = {
      employeeCode: 'EMP003',
      fullName: 'Alice Walker',
      email: 'alice.w@company.com',
      department: 'Finance & Accounting',
      designation: 'Financial Analyst',
      joiningDate: '2024-02-01',
      activeStatus: true
    };

    const savedEmployee: Employee = {
      ...newEmployee,
      employeeId: 3
    };

    service.createEmployee(newEmployee).subscribe((created: Employee) => {
      expect(created.employeeId).toBe(3);
      expect(created.fullName).toBe('Alice Walker');

      console.log(
        'Test 4 => PASS: Create employee => POST request sends employee data.'
      );
    });

    const req = httpMock.expectOne(apiUrl);

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newEmployee);

    req.flush(savedEmployee);
  });

  // Test 5: Update Employee
  it('Update employee => PUT request updates employee data.', () => {
    const updatedData: UpdateEmployeeRequest = {
      employeeCode: 'EMP001',
      fullName: 'John Doe',
      email: 'john.doe@company.com',
      department: 'Information Technology',
      designation: 'Lead Architect',
      joiningDate: '2023-01-15',
      activeStatus: true
    };

    const updatedEmployee: Employee = {
      ...updatedData,
      employeeId: 1
    };

    service.updateEmployee(1, updatedData).subscribe((emp: Employee) => {
      expect(emp.designation).toBe('Lead Architect');
      expect(emp.employeeId).toBe(1);

      console.log(
        'Test 5 => PASS: Update employee => PUT request updates employee data.'
      );
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);

    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedData);

    req.flush(updatedEmployee);
  });

  // Test 6: Delete Employee
  it('Delete employee => DELETE request removes employee by ID.', () => {
    service.deleteEmployee(1).subscribe(() => {
      console.log(
        'Test 6 => PASS: Delete employee => DELETE request removes employee by ID.'
      );
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);

    expect(req.request.method).toBe('DELETE');

    req.flush(null);
  });
});
