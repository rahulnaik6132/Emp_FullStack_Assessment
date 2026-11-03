import { SearchPipe } from './search.pipe';
import { Employee } from '../models/employee.model';

describe('SearchPipe', () => {
  let pipe: SearchPipe;

  const mockEmployees: Employee[] = [
    {
      employeeId: 1,
      employeeCode: 'EMP001',
      fullName: 'Michael Scott',
      email: 'michael.s@company.com',
      department: 'Marketing & Sales',
      designation: 'Regional Manager',
      joiningDate: '2020-01-15',
      activeStatus: true
    },
    {
      employeeId: 2,
      employeeCode: 'EMP002',
      fullName: 'Dwight Schrute',
      email: 'dwight.s@company.com',
      department: 'Marketing & Sales',
      designation: 'Assistant to the Regional Manager',
      joiningDate: '2021-03-20',
      activeStatus: false
    },
    {
      employeeId: 3,
      employeeCode: 'EMP003',
      fullName: 'Jim Halpert',
      email: 'jim.h@company.com',
      department: 'Information Technology',
      designation: 'Software Engineer',
      joiningDate: '2022-07-10',
      activeStatus: true
    }
  ];

  beforeEach(() => {
    pipe = new SearchPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return all employees when no search term or filters are provided', () => {
    const result = pipe.transform(mockEmployees, '', '', '');
    expect(result.length).toBe(3);
  });

  it('should filter employees by full name', () => {
    const result = pipe.transform(mockEmployees, 'Michael');
    expect(result.length).toBe(1);
    expect(result[0].fullName).toBe('Michael Scott');
  });

  it('should filter employees by employee code', () => {
    const result = pipe.transform(mockEmployees, 'EMP003');
    expect(result.length).toBe(1);
    expect(result[0].fullName).toBe('Jim Halpert');
  });

  it('should filter employees by designation', () => {
    const result = pipe.transform(mockEmployees, 'Software Engineer');
    expect(result.length).toBe(1);
    expect(result[0].fullName).toBe('Jim Halpert');
  });

  it('should filter employees by department', () => {
    const result = pipe.transform(mockEmployees, '', 'Information Technology', '');
    expect(result.length).toBe(1);
    expect(result[0].fullName).toBe('Jim Halpert');
  });

  it('should filter employees by active status', () => {
    const result = pipe.transform(mockEmployees, '', '', 'active');
    expect(result.length).toBe(2);
  });

  it('should filter employees by inactive status', () => {
    const result = pipe.transform(mockEmployees, '', '', 'inactive');
    expect(result.length).toBe(1);
    expect(result[0].fullName).toBe('Dwight Schrute');
  });

  it('should return empty array when employees list is empty or undefined', () => {
    expect(pipe.transform([] as any, 'test')).toEqual([]);
    expect(pipe.transform(null as any, 'test')).toEqual([]);
  });
});

