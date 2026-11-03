using EmployeeManagement.Domain.Entities;

namespace EmployeeManagement.Application.Interfaces;

public interface IEmployeeRepository
{
    Task<List<Employee>> GetAllAsync();

    Task<Employee?> GetByIdAsync(int id);

    Task<bool> EmployeeCodeExistsAsync(string employeeCode);

    Task<Employee> CreateAsync(Employee employee);

    Task<bool> UpdateAsync(Employee employee);

    //Siddarth -Delete employee by id
    Task<bool> DeleteAsync(int id);
}