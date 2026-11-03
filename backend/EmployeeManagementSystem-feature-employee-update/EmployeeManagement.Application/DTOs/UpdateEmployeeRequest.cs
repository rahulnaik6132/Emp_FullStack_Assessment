
using System.ComponentModel.DataAnnotations;

namespace EmployeeManagement.Application.DTOs;

public class UpdateEmployeeRequest
{
    [Required]
    [MaxLength(20)]
    public string EmployeeCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Department { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Designation { get; set; } = string.Empty;

    public DateTime JoiningDate { get; set; }

    public bool ActiveStatus { get; set; } = true;
}
