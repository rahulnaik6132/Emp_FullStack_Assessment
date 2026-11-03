import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { EmployeeList } from './employee-list';
import { EmployeeService } from '../../../../core/services/employee.service';
import { Employee } from '../../../models/employee.model';

describe('EmployeeList Component', () => {
  let component: EmployeeList;
  let fixture: ComponentFixture<EmployeeList>;
  let employeeService: EmployeeService;

  const mockEmployees: Employee[] = [
    {
      employeeId: 101,
      employeeCode: 'EMP101',
      fullName: 'Michael Scott',
      email: 'michael.s@company.com',
      department: 'Management',
      designation: 'Regional Manager',
      joiningDate: '2021-04-01',
      activeStatus: true
    },
    {
      employeeId: 102,
      employeeCode: 'EMP102',
      fullName: 'Pam Beesly',
      email: 'pam.b@company.com',
      department: 'Human Resources',
      designation: 'Office Administrator',
      joiningDate: '2022-08-15',
      activeStatus: true
    },
    {
      employeeId: 103,
      employeeCode: 'EMP103',
      fullName: 'Dwight Schrute',
      email: 'dwight.s@company.com',
      department: 'Marketing & Sales',
      designation: 'Assistant Regional Manager',
      joiningDate: '2021-06-01',
      activeStatus: false
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeList],
      providers: [
        EmployeeService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    employeeService = TestBed.inject(EmployeeService);

    vi.spyOn(employeeService, 'getEmployees')
      .mockReturnValue(of([...mockEmployees]));

    fixture = TestBed.createComponent(EmployeeList);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  // Test 1: Component creation
  it('should create the EmployeeList component', () => {
    expect(component).toBeTruthy();
  });

  // Test 2: Load employees
  it('should load employees on initialization', () => {
    expect(component.employees.length).toBe(3);
    expect(component.isLoading).toBe(false);
  });

  // Test 3: Search by full name
  it('should search and filter employees by Full Name', () => {
    component.searchTerm = 'Michael';

    expect(component.filteredEmployees.length).toBe(1);
    expect(component.filteredEmployees[0].fullName)
      .toBe('Michael Scott');
  });

  // Test 4: Search by employee code
  it('should search and filter employees by Employee Code', () => {
    component.searchTerm = 'EMP102';

    expect(component.filteredEmployees.length).toBe(1);
    expect(component.filteredEmployees[0].employeeCode)
      .toBe('EMP102');
  });

  // Test 5: Filter active and inactive employees
  it('should filter employees by active/inactive status', () => {
    component.selectedStatus = 'active';

    expect(component.filteredEmployees.length).toBe(2);

    component.selectedStatus = 'inactive';

    expect(component.filteredEmployees.length).toBe(1);
    expect(component.filteredEmployees[0].fullName)
      .toBe('Dwight Schrute');
  });

  // Test 6: Delete employee after confirmation
  it('should delete an employee when user confirms deletion', () => {
    const deleteSpy = vi
      .spyOn(employeeService, 'deleteEmployee')
      .mockReturnValue(
        of({
          message: 'Employee "Michael Scott" was deactivated successfully.'
        })
      );

    // Select Michael Scott for deletion
    component.openDeleteModal(mockEmployees[0]);

    expect(component.employeeToDelete).toEqual(mockEmployees[0]);
    expect(component.showDeleteModal).toBe(true);

    // Confirm deletion
    component.confirmDelete();

    // Verify API call
    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(101);

    // Verify employee is removed from the list
    expect(component.employees.length).toBe(2);

    expect(
      component.employees.some(
        employee => employee.employeeId === 101
      )
    ).toBe(false);

    // Verify confirmation modal is closed
    expect(component.showDeleteModal).toBe(false);
    expect(component.employeeToDelete).toBeNull();

    // Verify success message
    expect(component.successMessage).toContain('Michael Scott');
  });
});
