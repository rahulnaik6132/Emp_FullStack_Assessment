import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  Employee
} from '../../../models/employee.model';

import {
  EmployeeService
} from '../../../../core/services/employee.service';

@Component({
  selector: 'app-employee-detail',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink
  ],

  templateUrl: './employee-detail.html',
  styleUrl: './employee-detail.css'
})
export class EmployeeDetail implements OnInit, OnDestroy {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private employeeService = inject(EmployeeService);
  private cdr = inject(ChangeDetectorRef);

  employee: Employee | null = null;

  isLoading = true;

  errorMessage = '';
  actionErrorMessage = '';

  private actionErrorTimer:
    ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {

    // Get employee ID from route.
    const routeId =
      this.route.snapshot.paramMap.get('id');

    if (!routeId) {

      this.errorMessage =
        'Employee ID was not provided in the route.';

      this.isLoading = false;

      this.cdr.markForCheck();

      return;
    }

    const id = Number(routeId);

    // Validate employee ID.
    if (!Number.isFinite(id) || id <= 0) {

      this.errorMessage =
        'Invalid employee ID.';

      this.isLoading = false;

      this.cdr.markForCheck();

      return;
    }

    this.fetchEmployee(id);
  }

  // Fetch employee details.
  fetchEmployee(id: number): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.cdr.markForCheck();

    this.employeeService
      .getEmployeeById(id)
      .subscribe({

        next: (data: Employee) => {

          this.employee = data;

          this.isLoading = false;

          this.cdr.markForCheck();
        },

        error: (error) => {

          console.error(
            'Fetch employee API error:',
            error
          );

          this.errorMessage =
            'Unable to retrieve employee details.';

          this.isLoading = false;

          this.cdr.markForCheck();
        }

      });

  }

  // Format joining date without displaying time.
  formatJoiningDate(dateValue: string | Date | null | undefined): string {
    if (!dateValue) {
      return '';
    }

    const dateString = String(dateValue).substring(0, 10);

    const [year, month, day] = dateString.split('-');

    if (!year || !month || !day) {
      return dateString;
    }

    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

    if (isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  // Delete current employee.
  deleteCurrentEmployee(): void {

    const id = this.employee?.employeeId;

    if (
      id === undefined ||
      id === null ||
      id <= 0
    ) {
      this.actionErrorMessage =
        'Employee ID is missing.';

      this.cdr.markForCheck();

      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete employee "${this.employee?.fullName}"?`
    );

    if (!confirmed) {
      return;
    }

    this.employeeService
      .deleteEmployee(id)
      .subscribe({

        next: () => {

          this.router.navigate(
            ['/employees'],
            {
              state: {
                successMessage:
                  `Employee "${this.employee?.fullName}" was successfully deleted.`
              }
            }
          );

        },

        error: (error) => {

          console.error(
            'Delete employee API error:',
            error
          );

          this.showActionError(
            'Failed to delete employee.'
          );

        }

      });

  }

  // Show action error notification.
  private showActionError(message: string): void {

    if (this.actionErrorTimer) {
      clearTimeout(this.actionErrorTimer);
    }

    this.actionErrorMessage = message;

    this.actionErrorTimer = setTimeout(() => {

      this.actionErrorMessage = '';

      this.actionErrorTimer = null;

      this.cdr.markForCheck();

    }, 5000);

    this.cdr.markForCheck();
  }

  // Clear action error notification.
  clearActionError(): void {

    if (this.actionErrorTimer) {
      clearTimeout(this.actionErrorTimer);
      this.actionErrorTimer = null;
    }

    this.actionErrorMessage = '';

    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {

    if (this.actionErrorTimer) {
      clearTimeout(this.actionErrorTimer);
      this.actionErrorTimer = null;
    }

  }

}