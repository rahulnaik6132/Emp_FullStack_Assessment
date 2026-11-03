
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest
} from '../../shared/models/employee.model';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private http = inject(HttpClient);

  // Example: http://localhost:5004/api/Employees
  private apiUrl = `${environment.apiUrl}/Employees`;

  // GET: Retrieve all employees
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  // GET: Retrieve employee by ID
  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  // POST: Create employee
  createEmployee(
    employee: CreateEmployeeRequest
  ): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  // PUT: Update employee
  updateEmployee(
    id: number,
    employee: UpdateEmployeeRequest
  ): Observable<Employee> {
    return this.http.put<Employee>(
      `${this.apiUrl}/${id}`,
      employee
    );
  }

  // DELETE: Soft delete / Deactivate employee
  deleteEmployee(
    id: number
  ): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${id}`
    );
  }
}
