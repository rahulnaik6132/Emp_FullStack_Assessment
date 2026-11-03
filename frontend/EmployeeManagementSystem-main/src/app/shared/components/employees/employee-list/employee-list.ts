import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Employee, DEPARTMENTS } from '../../../models/employee.model';
import { EmployeeService } from '../../../../core/services/employee.service';
import { SearchPipe } from '../../../pipes/search.pipe';

@Component({
  selector: 'app-employee-list',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css'
})
export class EmployeeList implements OnInit, OnDestroy {

  // Services
  private employeeService = inject(EmployeeService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private searchPipe = new SearchPipe();

  // Department list
  readonly departments = DEPARTMENTS;

  // Employee data
  employees: Employee[] = [];

  // Loading and messages
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Delete and view modal
  deletingEmployeeId: number | null = null;
  // Delete confirmation modal
  showDeleteModal = false;
  employeeToDelete: Employee | null = null;
  selectedEmployee: Employee | null = null;

  // Filters
  searchTerm = '';
  selectedDepartment = '';
  selectedStatus = '';

  // Notification timers
  private successTimer: ReturnType<typeof setTimeout> | null = null;
  private errorTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    const navigation = this.router.getCurrentNavigation();

    this.successMessage =
      navigation?.extras.state?.['successMessage'] ||
      history.state?.successMessage ||
      '';
  }

  // Component initialization
  ngOnInit(): void {
    this.fetchEmployees();

    if (this.successMessage) {
      this.autoDismissSuccess();
    }
  }

  // Clear timers when component is destroyed
  ngOnDestroy(): void {
    if (this.successTimer) {
      clearTimeout(this.successTimer);
    }

    if (this.errorTimer) {
      clearTimeout(this.errorTimer);
    }
  }

  // Get employee ID
  getEmployeeId(employee: Employee): number {
    return employee.employeeId;
  }

  // Fetch employees from backend
  fetchEmployees(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.cdr.markForCheck();

    this.employeeService.getEmployees().subscribe({
      next: (data: Employee[]) => {
        this.employees = data;
        this.isLoading = false;

        this.cdr.markForCheck();
      },

      error: (error) => {
        console.error('API Error:', error);

        this.errorMessage =
          'Failed to load employees from the server.';

        this.isLoading = false;

        this.autoDismissError();

        this.cdr.markForCheck();
      }
    });
  }

  // Open employee view modal
  openViewModal(employee: Employee): void {
    this.selectedEmployee = employee;

    this.cdr.markForCheck();
  }

  // Close employee view modal
  closeViewModal(): void {
    this.selectedEmployee = null;

    this.cdr.markForCheck();
  }

  // Confirm and delete employee
  // Open custom delete confirmation modal
  openDeleteModal(employee: Employee): void {
    this.employeeToDelete = employee;
    this.showDeleteModal = true;

    this.cdr.markForCheck();
  }

  // Cancel delete
  cancelDelete(): void {
    this.showDeleteModal = false;
    this.employeeToDelete = null;

    this.cdr.markForCheck();
  }

  // Confirm and delete employee

  // Confirm and deactivate employee
  confirmDelete(): void {

    if (!this.employeeToDelete) {
      return;
    }

    const employee = this.employeeToDelete;
    const id = this.getEmployeeId(employee);

    if (!Number.isFinite(id) || id <= 0) {
      this.errorMessage =
        'Cannot deactivate employee because the employee ID is missing.';

      this.autoDismissError();
      this.cdr.markForCheck();
      return;
    }

    this.deletingEmployeeId = id;
    this.errorMessage = '';
    this.successMessage = '';

    this.cdr.markForCheck();

    this.employeeService.deleteEmployee(id).subscribe({

      next: (response) => {

        // Remove inactive employee from current frontend list
        this.employees = this.employees.filter(
          e => this.getEmployeeId(e) !== id
        );

        // Close view modal if the same employee is selected
        if (
          this.selectedEmployee &&
          this.getEmployeeId(this.selectedEmployee) === id
        ) {
          this.selectedEmployee = null;
        }

        // Close delete confirmation modal
        this.showDeleteModal = false;
        this.employeeToDelete = null;

        // Display success message
        this.successMessage =
          response.message ||
          `Employee "${employee.fullName}" was deactivated successfully.`;

        this.deletingEmployeeId = null;

        this.autoDismissSuccess();
        this.cdr.markForCheck();
      },

      error: (error) => {

        console.error('Delete API Error:', error);

        this.errorMessage =
          error.error?.message ||
          'Failed to deactivate the employee.';

        this.deletingEmployeeId = null;

        this.showDeleteModal = false;
        this.employeeToDelete = null;

        this.autoDismissError();
        this.cdr.markForCheck();
      }

    });
  }


  // Automatically dismiss success message
  private autoDismissSuccess(): void {
    if (this.successTimer) {
      clearTimeout(this.successTimer);
    }

    this.successTimer = setTimeout(() => {
      this.successMessage = '';
      this.successTimer = null;

      this.cdr.markForCheck();
    }, 4000);
  }

  // Automatically dismiss error message
  private autoDismissError(): void {
    if (this.errorTimer) {
      clearTimeout(this.errorTimer);
    }

    this.errorTimer = setTimeout(() => {
      this.errorMessage = '';
      this.errorTimer = null;

      this.cdr.markForCheck();
    }, 5000);
  }

  // Manually clear success message
  clearSuccessMessage(): void {
    if (this.successTimer) {
      clearTimeout(this.successTimer);
      this.successTimer = null;
    }

    this.successMessage = '';

    this.cdr.markForCheck();
  }

  // Manually clear error message
  clearErrorMessage(): void {
    if (this.errorTimer) {
      clearTimeout(this.errorTimer);
      this.errorTimer = null;
    }

    this.errorMessage = '';

    this.cdr.markForCheck();
  }

  // Filter employees
  get filteredEmployees(): Employee[] {
    return this.searchPipe.transform(
      this.employees,
      this.searchTerm,
      this.selectedDepartment,
      this.selectedStatus
    );
  }

}