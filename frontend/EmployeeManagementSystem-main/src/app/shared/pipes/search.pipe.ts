import { Pipe, PipeTransform } from '@angular/core';
import { Employee } from '../models/employee.model';

@Pipe({
  name: 'search',
  standalone: true
})
export class SearchPipe implements PipeTransform {

  transform(
    employees: Employee[],
    searchTerm: string = '',
    department: string = '',
    status: string = ''
  ): Employee[] {
    if (!employees || !Array.isArray(employees)) {
      return [];
    }

    const query = (searchTerm || '').trim().toLowerCase();
    const selectedDepartment = (department || '').trim();
    const selectedStatus = (status || '').trim().toLowerCase();

    return employees.filter((employee) => {
      // 1. Search filter: matches full name, employee code, or designation
      const matchesSearch =
        !query ||
        (employee.fullName || '').toLowerCase().includes(query) ||
        (employee.employeeCode || '').toLowerCase().includes(query) ||
        (employee.designation || '').toLowerCase().includes(query);

      // 2. Department filter
      const matchesDepartment =
        !selectedDepartment || employee.department === selectedDepartment;

      // 3. Status filter: active or inactive
      const matchesStatus =
        !selectedStatus ||
        (selectedStatus === 'active' && employee.activeStatus) ||
        (selectedStatus === 'inactive' && !employee.activeStatus);

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }
}

