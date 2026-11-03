
using EmployeeManagement.Application.DTOs;

namespace EmployeeManagement.Application.Interfaces;

public interface IEmployeeService
{
    Task<List<EmployeeResponse>> GetAllAsync();

    Task<EmployeeResponse?> GetByIdAsync(int id);

    Task<EmployeeResponse> CreateAsync(
        CreateEmployeeRequest request);

    Task<bool> UpdateAsync(
        int id,
        UpdateEmployeeRequest request);

    //Siddarth -Delete employee by id
    Task<bool> DeleteEmployeeAsync(int id);
}
