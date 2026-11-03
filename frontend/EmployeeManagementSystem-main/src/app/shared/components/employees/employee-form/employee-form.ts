
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  DEPARTMENTS
} from '../../../models/employee.model';

import {
  EmployeeService
} from '../../../../core/services/employee.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './employee-form.html',
  styleUrl: './employee-form.css'
})
export class EmployeeForm implements OnInit, OnDestroy {

  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  departments = DEPARTMENTS;

  isEditMode = false;
  employeeId: number | null = null;

  existingEmployees: Employee[] = [];

  isLoading = false;
  isSubmitting = false;

  errorMessage = '';

  private errorTimer: ReturnType<typeof setTimeout> | null = null;

  today = this.getTodayDate();

  employeeForm: FormGroup = this.fb.group({
    // Only the numeric part is stored in the form.
    // EMP is added when creating the API payload.
    employeeCode: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(7),
        Validators.pattern(/^\d+$/),
        this.validateEmployeeCode.bind(this)
      ]
    ],

    fullName: [
      '',
      [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(30),
        this.validateFullName.bind(this)
      ]
    ],

    email: [
      '',
      [
        Validators.required,
        this.validateEmail.bind(this)
      ]
    ],

    department: [
      '',
      Validators.required
    ],

    designation: [
      '',
      [
        Validators.required,
        this.validateDesignation.bind(this)
      ]
    ],

    joiningDate: [
      '',
      [
        Validators.required,
        this.validateJoiningDate.bind(this)
      ]
    ],

    activeStatus: [
      true,
      Validators.required
    ]
  });

  ngOnInit(): void {
    this.loadEmployeesForValidation();

    const routeId = this.route.snapshot.paramMap.get('id');

    if (routeId) {
      const id = Number(routeId);

      if (!Number.isFinite(id) || id <= 0) {
        this.showErrorPopup('Invalid employee ID.');
        return;
      }

      this.isEditMode = true;
      this.employeeId = id;

      this.loadEmployee(id);
    }
  }

  ngOnDestroy(): void {
    if (this.errorTimer) {
      clearTimeout(this.errorTimer);
      this.errorTimer = null;
    }
  }

  // -------------------------------
  // Date helpers
  // -------------------------------

  getTodayDate(): string {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  formatDateForInput(
    dateValue: string | Date | null | undefined
  ): string {
    if (!dateValue) {
      return '';
    }

    if (typeof dateValue === 'string') {
      const match = dateValue.match(/^(\d{4}-\d{2}-\d{2})/);

      if (match) {
        return match[1];
      }
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // -------------------------------
  // Employee code input
  // -------------------------------

  onEmailInput(event: Event): void {
    const input = event.target as HTMLInputElement;

    // Remove spaces from the email while typing
    const email = input.value.replace(/\s/g, '');

    input.value = email;

    this.employeeForm.get('email')?.setValue(email, {
      emitEvent: false
    });

    this.employeeForm.get('email')?.updateValueAndValidity({
      emitEvent: false
    });
  }

  onEmployeeCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;

    // Only allow digits.
    // EMP is displayed separately in the HTML.
    const digits = input.value.replace(/\D/g, '');

    input.value = digits;

    this.employeeForm.get('employeeCode')?.setValue(digits, {
      emitEvent: false
    });

    this.employeeForm.get('employeeCode')?.updateValueAndValidity({
      emitEvent: false
    });
  }

  // Convert numeric form value into complete employee code.
  // Example: 123 becomes EMP123.
  private getCompleteEmployeeCode(value: unknown): string {
    const digits = String(value ?? '')
      .trim()
      .replace(/\D/g, '');

    return `EMP${digits}`;
  }

  // -------------------------------
  // Load employees for validation
  // -------------------------------

  loadEmployeesForValidation(): void {
    this.employeeService.getEmployees().subscribe({
      next: (employees: Employee[]) => {
        this.existingEmployees = employees || [];

        this.employeeForm
          .get('employeeCode')
          ?.updateValueAndValidity();

        this.employeeForm
          .get('email')
          ?.updateValueAndValidity();

        this.cdr.markForCheck();
      },

      error: (error) => {
        console.error(
          'Failed to load employees for validation:',
          error
        );
      }
    });
  }

  // -------------------------------
  // Load employee in edit mode
  // -------------------------------

  loadEmployee(id: number): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.employeeService.getEmployeeById(id).subscribe({
      next: (employee: Employee) => {
        // Remove EMP from the stored code for the input.
        // Example: EMP645 becomes 645.
        const numericEmployeeCode = String(
          employee.employeeCode ?? ''
        )
          .trim()
          .replace(/^EMP/i, '')
          .replace(/\D/g, '');

        this.employeeForm.patchValue({
          employeeCode: numericEmployeeCode,

          fullName: employee.fullName ?? '',

          email: employee.email ?? '',

          department: employee.department ?? '',

          designation: employee.designation ?? '',

          joiningDate: this.formatDateForInput(
            employee.joiningDate
          ),

          activeStatus: employee.activeStatus ?? true
        });

        this.isLoading = false;

        this.employeeForm
          .get('employeeCode')
          ?.updateValueAndValidity();

        this.employeeForm
          .get('email')
          ?.updateValueAndValidity();

        this.employeeForm
          .get('joiningDate')
          ?.updateValueAndValidity();

        this.cdr.markForCheck();
      },

      error: (error) => {
        console.error('Failed to load employee:', error);

        this.isLoading = false;

        this.showErrorPopup(
          'Unable to load employee details.'
        );

        this.cdr.markForCheck();
      }
    });
  }

  // -------------------------------
  // Full name validation
  // -------------------------------

  validateFullName(
    control: AbstractControl
  ): ValidationErrors | null {
    const value = control.value;

    if (!value) {
      return null;
    }

    const namePattern = /^[A-Z][a-z]*(?: [A-Z][a-z]*)*$/;

    if (!namePattern.test(value)) {
      return {
        invalidFullName: true
      };
    }

    return null;
  }

  // -------------------------------
  // Designation validation
  // -------------------------------

  validateDesignation(
    control: AbstractControl
  ): ValidationErrors | null {
    const value = control.value;

    if (!value) {
      return null;
    }

    const designationPattern =
      /^[A-Z][a-z]*(?: [A-Z][a-z]*)*$/;

    if (!designationPattern.test(value)) {
      return {
        invalidDesignation: true
      };
    }

    return null;
  }

  // -------------------------------
  // Joining date validation
  // -------------------------------

  validateJoiningDate(
    control: AbstractControl
  ): ValidationErrors | null {
    const value = control.value;

    if (!value) {
      return null;
    }

    const selectedDate = String(value);
    const currentDate = this.getTodayDate();

    if (selectedDate > currentDate) {
      return {
        futureDate: true
      };
    }

    return null;
  }

  // -------------------------------
  // Employee code validation
  // -------------------------------

  validateEmployeeCode(
    control: AbstractControl
  ): ValidationErrors | null {
    const value = control.value;

    if (!value) {
      return null;
    }

    const digits = String(value).trim();

    // This control should contain digits only.
    if (!/^\d+$/.test(digits)) {
      return {
        pattern: true
      };
    }

    // Compare the complete code against existing employees.
    const completeCode = `EMP${digits}`.toUpperCase();

    const isDuplicate = this.existingEmployees.some(
      (employee: Employee) => {
        if (!employee.employeeCode) {
          return false;
        }

        const existingCode = employee.employeeCode
          .trim()
          .toUpperCase();

        const sameCode = existingCode === completeCode;

        if (!sameCode) {
          return false;
        }

        // In edit mode, allow the current employee's own code.
        if (
          this.isEditMode &&
          this.employeeId !== null
        ) {
          return employee.employeeId !== this.employeeId;
        }

        return true;
      }
    );

    if (isDuplicate) {
      return {
        codeTaken: true
      };
    }

    return null;
  }

  // -------------------------------
  // Email validation
  // -------------------------------

  validateEmail(
    control: AbstractControl
  ): ValidationErrors | null {
    const value = control.value;

    if (!value) {
      return null;
    }

    const email = String(value).trim();

    if (/\s/.test(email)) {
      return {
        emailSpaces: true,
        email: true
      };
    }

    const emailRegex =
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i;

    if (!emailRegex.test(email)) {
      return {
        invalidEmailFormat: true,
        email: true
      };
    }

    if (email.toLowerCase().endsWith('@example.com')) {
      return {
        invalidEmailFormat: true,
        email: true
      };
    }

    const isDuplicate = this.existingEmployees.some(
      (employee: Employee) => {
        if (!employee.email) {
          return false;
        }

        const sameEmail =
          employee.email.trim().toLowerCase() ===
          email.toLowerCase();

        if (!sameEmail) {
          return false;
        }

        if (
          this.isEditMode &&
          this.employeeId !== null
        ) {
          return employee.employeeId !== this.employeeId;
        }

        return true;
      }
    );

    if (isDuplicate) {
      return {
        emailTaken: true,
        email: true
      };
    }

    return null;
  }

  // -------------------------------
  // Form validation helper
  // -------------------------------

  isFieldInvalid(fieldName: string): boolean {
    const field = this.employeeForm.get(fieldName);

    return !!(
      field &&
      field.invalid &&
      (field.touched || field.dirty)
    );
  }

  // -------------------------------
  // Error notification
  // -------------------------------

  showErrorPopup(message: string): void {
    if (this.errorTimer) {
      clearTimeout(this.errorTimer);
    }

    this.errorMessage = message;

    this.errorTimer = setTimeout(() => {
      this.errorMessage = '';
      this.errorTimer = null;

      this.cdr.markForCheck();
    }, 5000);

    this.cdr.markForCheck();
  }

  clearErrorMessage(): void {
    if (this.errorTimer) {
      clearTimeout(this.errorTimer);
      this.errorTimer = null;
    }

    this.errorMessage = '';

    this.cdr.markForCheck();
  }

  // -------------------------------
  // Submit form
  // -------------------------------

  onSubmit(): void {
    this.clearErrorMessage();

    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();

      this.showErrorPopup(
        'Please check the form. All required fields must be valid.'
      );

      return;
    }

    if (this.isSubmitting || this.isLoading) {
      return;
    }

    this.isSubmitting = true;

    const formValues = this.employeeForm.getRawValue();

    // Add EMP prefix before sending the request.
    // Example: numeric value 123 becomes EMP123.
    const completeEmployeeCode =
      this.getCompleteEmployeeCode(formValues.employeeCode);

    const payload: CreateEmployeeRequest = {
      employeeCode: completeEmployeeCode,

      fullName: String(formValues.fullName).trim(),

      email: String(formValues.email)
        .trim()
        .toLowerCase(),

      department: formValues.department,

      designation: String(formValues.designation).trim(),

      joiningDate: formValues.joiningDate,

      activeStatus:
        formValues.activeStatus === true ||
        formValues.activeStatus === 'true'
    };

    // -------------------------------
    // Update employee
    // -------------------------------

    if (
      this.isEditMode &&
      this.employeeId !== null
    ) {
      const updatePayload: UpdateEmployeeRequest = {
        ...payload
      };

      this.employeeService
        .updateEmployee(
          this.employeeId,
          updatePayload
        )
        .subscribe({
          next: () => {
            this.isSubmitting = false;

            this.router.navigate(
              ['/employees'],
              {
                state: {
                  successMessage:
                    `Employee "${payload.fullName}" (${payload.employeeCode}) was successfully updated!`
                }
              }
            );
          },

          error: (error) => {
            console.error(
              'Update employee API error:',
              error
            );

            this.isSubmitting = false;

            this.showErrorPopup(
              'Failed to update employee details.'
            );

            this.cdr.markForCheck();
          }
        });

      return;
    }

    // -------------------------------
    // Create employee
    // -------------------------------

    this.employeeService
      .createEmployee(payload)
      .subscribe({
        next: () => {
          this.isSubmitting = false;

          this.router.navigate(
            ['/employees'],
            {
              state: {
                successMessage:
                  `Employee "${payload.fullName}" (${payload.employeeCode}) was successfully added!`
              }
            }
          );
        },

        error: (error) => {
          console.error(
            'Create employee API error:',
            error
          );

          this.isSubmitting = false;

          this.showErrorPopup(
            'Failed to create employee record.'
          );

          this.cdr.markForCheck();
        }
      });
  }

  // -------------------------------
  // Cancel
  // -------------------------------

  cancel(): void {
    this.router.navigate(['/employees']);
  }
}
