import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { EmployeeForm } from './employee-form';
import { EmployeeService } from '../../../../core/services/employee.service';
import { Employee } from '../../../models/employee.model';

describe('EmployeeForm Component', () => {
  let component: EmployeeForm;
  let fixture: ComponentFixture<EmployeeForm>;
  let employeeService: EmployeeService;
  let router: Router;

  const mockEmployee: Employee = {
    employeeId: 5,
    employeeCode: 'EMP005',
    fullName: 'David Wallace',
    email: 'david.w@company.com',
    department: 'Operations',
    designation: 'CFO',
    joiningDate: '2020-03-10',
    activeStatus: true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeForm],
      providers: [
        EmployeeService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => null
              }
            }
          }
        }
      ]
    }).compileComponents();

    employeeService = TestBed.inject(EmployeeService);
    router = TestBed.inject(Router);

    fixture = TestBed.createComponent(EmployeeForm);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  // 1. Component creation
  it('should create the EmployeeForm component', () => {
    expect(component).toBeTruthy();
    expect(component.isEditMode).toBe(false);
  });

  // 2. Required field validation
  it('should mark form as invalid when required fields are empty', () => {
    component.employeeForm.controls['employeeCode'].setValue('');
    component.employeeForm.controls['fullName'].setValue('');
    component.employeeForm.controls['email'].setValue('');
    component.employeeForm.controls['department'].setValue('');
    component.employeeForm.controls['designation'].setValue('');
    component.employeeForm.controls['joiningDate'].setValue('');

    expect(component.employeeForm.valid).toBe(false);

    expect(
      component.employeeForm.controls['employeeCode'].hasError('required')
    ).toBe(true);

    expect(
      component.employeeForm.controls['fullName'].hasError('required')
    ).toBe(true);

    expect(
      component.employeeForm.controls['email'].hasError('required')
    ).toBe(true);
  });

  // 3. Email validation
  it('should validate email format correctly', () => {
    const emailControl = component.employeeForm.controls['email'];

    emailControl.setValue('invalid-email-address');
    expect(emailControl.hasError('email')).toBe(true);

    emailControl.setValue('user@domain');
    expect(emailControl.hasError('email')).toBe(true);

    emailControl.setValue('user with spaces@company.com');
    expect(emailControl.hasError('email')).toBe(true);

    emailControl.setValue('valid.employee@company.com');
    expect(emailControl.hasError('email')).toBe(false);

    emailControl.setValue('john.doe+tag@sub.example.co.uk');
    expect(emailControl.hasError('email')).toBe(false);
  });

  // 4. Employee code validation
  it('should validate employee code correctly', () => {
    const codeControl = component.employeeForm.controls['employeeCode'];

    // Minimum length validation
    codeControl.setValue('AB');
    expect(codeControl.hasError('minlength')).toBe(true);

    // Spaces validation
    codeControl.setValue('EMP 01');
    expect(codeControl.hasError('codeSpaces')).toBe(true);

    // Missing digit validation
    codeControl.setValue('EMPABC');
    expect(codeControl.hasError('missingDigit')).toBe(true);

    // Invalid character validation
    codeControl.setValue('EMP@123');
    expect(codeControl.hasError('pattern')).toBe(true);

    // Duplicate employee code validation
    component.existingEmployees = [
      {
        employeeCode: 'EMP101',
        fullName: 'Existing User'
      } as any
    ];

    codeControl.setValue('EMP101');
    expect(codeControl.hasError('codeTaken')).toBe(true);

    // Valid unique employee code
    codeControl.setValue('EMP999');
    expect(codeControl.valid).toBe(true);
  });

  // 5. Add employee
  it('should call createEmployee on service when submitting valid form in Add mode', () => {
    const createSpy = vi
      .spyOn(employeeService, 'createEmployee')
      .mockReturnValue(
        of({
          ...mockEmployee,
          employeeId: 6,
          employeeCode: 'EMP006',
          fullName: 'Jim Halpert'
        })
      );

    const navigateSpy = vi.spyOn(router, 'navigate');

    component.employeeForm.setValue({
      employeeCode: 'EMP006',
      fullName: 'Jim Halpert',
      email: 'jim.h@company.com',
      department: 'Marketing & Sales',
      designation: 'Sales Representative',
      joiningDate: '2023-01-10',
      activeStatus: true
    });

    expect(component.employeeForm.valid).toBe(true);

    component.onSubmit();

    expect(createSpy).toHaveBeenCalled();

    expect(navigateSpy).toHaveBeenCalledWith(
      ['/employees'],
      expect.anything()
    );
  });

  // 6. Update employee
  it('should call updateEmployee on service when submitting valid form in Edit mode', () => {
    component.isEditMode = true;
    component.employeeId = 5;

    const updateSpy = vi
      .spyOn(employeeService, 'updateEmployee')
      .mockReturnValue(of(mockEmployee));

    const navigateSpy = vi.spyOn(router, 'navigate');

    component.employeeForm.setValue({
      employeeCode: 'EMP005',
      fullName: 'David Wallace',
      email: 'david.w@company.com',
      department: 'Operations',
      designation: 'CFO',
      joiningDate: '2020-03-10',
      activeStatus: true
    });

    // Verify Edit mode configuration
    expect(component.isEditMode).toBe(true);
    expect(component.employeeId).toBe(5);

    // Verify the form is valid before submission
    expect(component.employeeForm.valid).toBe(true);

    component.onSubmit();

    // Verify updateEmployee was called with the correct employee ID
    expect(updateSpy).toHaveBeenCalledWith(
      5,
      expect.objectContaining({
        employeeCode: 'EMP005',
        fullName: 'David Wallace',
        email: 'david.w@company.com',
        department: 'Operations',
        designation: 'CFO',
        joiningDate: '2020-03-10',
        activeStatus: true
      })
    );

    // Verify navigation after successful update
    expect(navigateSpy).toHaveBeenCalledWith(
      ['/employees'],
      expect.anything()
    );
  });
});
