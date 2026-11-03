import { Routes } from '@angular/router';
import { Dashboard } from './shared/components/dashboard/dashboard';
import { EmployeeList } from './shared/components/employees/employee-list/employee-list';
import { EmployeeForm } from './shared/components/employees/employee-form/employee-form';
import { EmployeeDetail } from './shared/components/employees/employee-detail/employee-detail';

/**
 * Application Routes for Employee Management System
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: Dashboard,
    title: 'Dashboard - Employee Management System'
  },
  {
    path: 'employees',
    component: EmployeeList,
    title: 'Employees - Employee Management System'
  },
  {
    path: 'employees/add',
    component: EmployeeForm,
    title: 'Add Employee - Employee Management System'
  },
  {
    path: 'employees/edit/:id',
    component: EmployeeForm,
    title: 'Edit Employee - Employee Management System'
  },
  {
    path: 'employees/:id',
    component: EmployeeDetail,
    title: 'Employee Details - Employee Management System'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
