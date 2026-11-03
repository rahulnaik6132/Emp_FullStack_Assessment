import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Dashboard } from './dashboard';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../models/employee.model';

describe('Dashboard Component', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let employeeService: EmployeeService;

  const mockEmployees: Employee[] = [
    {
      employeeId: 1,
      employeeCode: 'EMP001',
      fullName: 'Alice Smith',
      email: 'alice@company.com',
      department: 'Information Technology',
      designation: 'Tech Lead',
      joiningDate: '2022-01-01',
      activeStatus: true
    },
    {
      employeeId: 2,
      employeeCode: 'EMP002',
      fullName: 'Bob Martin',
      email: 'bob@company.com',
      department: 'Human Resources',
      designation: 'Recruiter',
      joiningDate: '2023-03-15',
      activeStatus: false
    },
    {
      employeeId: 3,
      employeeCode: 'EMP003',
      fullName: 'Charlie Brown',
      email: 'charlie@company.com',
      department: 'Information Technology',
      designation: 'DevOps Engineer',
      joiningDate: '2023-06-20',
      activeStatus: true
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        EmployeeService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    employeeService = TestBed.inject(EmployeeService);
    vi.spyOn(employeeService, 'getEmployees').mockReturnValue(of(mockEmployees));

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the Dashboard component', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate metrics properly from employee records', () => {
    expect(component.totalEmployees).toBe(3);
    expect(component.activeEmployees).toBe(2);
    expect(component.inactiveEmployees).toBe(1);
    expect(component.departmentCount).toBe(2); // IT and HR
  });

  it('should extract recent employees properly', () => {
    expect(component.recentEmployees.length).toBe(3);
    expect(component.recentEmployees[0].employeeCode).toBe('EMP003'); // reversed
  });
});
