import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Employee } from '../../models/employee.model';
import { EmployeeService } from '../../../core/services/employee.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private employeeService = inject(EmployeeService);
  private cdr = inject(ChangeDetectorRef);

  employees: Employee[] = [];
  isLoading = false;
  errorMessage = '';
  private errorTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.loadMetrics();
  }

  loadMetrics(): void {
    this.clearErrorMessage();

    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Unable to retrieve employee metrics.';
        this.cdr.markForCheck();

        this.errorTimer = setTimeout(() => {
          this.errorMessage = '';
          this.cdr.markForCheck();
        }, 5000);
      }
    });
  }

  clearErrorMessage(): void {
    if (this.errorTimer) {
      clearTimeout(this.errorTimer);
      this.errorTimer = null;
    }

    this.errorMessage = '';
    this.cdr.markForCheck();
  }

  get totalEmployees(): number {
    return this.employees.length;
  }

  get activeEmployees(): number {
    return this.employees.filter(e => e.activeStatus).length;
  }

  get inactiveEmployees(): number {
    return this.employees.filter(e => !e.activeStatus).length;
  }

  get departmentCount(): number {
    return new Set(this.employees.map(e => e.department)).size;
  }

  get recentEmployees(): Employee[] {
    return this.employees.slice(-4).reverse();
  }
}
