
namespace EmployeeManagement.Application.DTOs;

public class EmployeeResponse
{
    public int EmployeeId { get; set; }

    public string EmployeeCode { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public string Designation { get; set; } = string.Empty;

    public DateTime JoiningDate { get; set; }

    public bool ActiveStatus { get; set; }
}
