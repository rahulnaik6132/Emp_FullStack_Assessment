using EmployeeManagement.Application.DTOs;
using EmployeeManagement.Application.Interfaces;
using EmployeeManagement.Application.Services;
using EmployeeManagement.Domain.Entities;
using Moq;
using Xunit;

namespace EmployeeManagement.Tests;

public class EmployeeServiceTests
{
    private readonly Mock<IEmployeeRepository> _mockRepository;
    private readonly EmployeeService _employeeService;

    public EmployeeServiceTests()
    {
        _mockRepository = new Mock<IEmployeeRepository>();

        _employeeService = new EmployeeService(
            _mockRepository.Object
        );
    }

    
    // VISHNU - GET ALL EMPLOYEES
    

    [Fact]
    public async Task GetAllAsync_ShouldReturnEmployees()
    {
        // Arrange
        var employees = new List<Employee>
        {
            new Employee
            {
                EmployeeId = 1,
                EmployeeCode = "EMP001",
                FullName = "Chandu"
            },
            new Employee
            {
                EmployeeId = 2,
                EmployeeCode = "EMP002",
                FullName = "Rahul"
            }
        };

        _mockRepository
            .Setup(x => x.GetAllAsync())
            .ReturnsAsync(employees);

        // Act
        var result = await _employeeService.GetAllAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task GetAllAsync_ShouldThrowException_WhenDatabaseFails()
    {
        // Arrange
        _mockRepository
            .Setup(x => x.GetAllAsync())
            .ThrowsAsync(new Exception("Database connection failed"));

        // Act & Assert
        var exception = await Assert.ThrowsAsync<Exception>(
            () => _employeeService.GetAllAsync()
        );

        Assert.Equal(
            "Database connection failed",
            exception.Message
        );
    }


   
    // SAI - GET EMPLOYEE BY ID
    

    [Fact]
    public async Task GetByIdAsync_ReturnsEmployee_WhenEmployeeExists()
    {
        // Arrange
        var employee = new Employee
        {
            EmployeeId = 1,
            EmployeeCode = "EMP001",
            FullName = "Sai Kumar",
            Email = "sai@example.com",
            Department = "IT",
            Designation = "Software Developer Intern",
            JoiningDate = new DateTime(2026, 10, 29),
            ActiveStatus = true
        };

        _mockRepository
            .Setup(repo => repo.GetByIdAsync(1))
            .ReturnsAsync(employee);

        // Act
        var result = await _employeeService.GetByIdAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.EmployeeId);
        Assert.Equal("EMP001", result.EmployeeCode);
        Assert.Equal("Sai Kumar", result.FullName);
        Assert.Equal("sai@example.com", result.Email);
        Assert.Equal("IT", result.Department);
        Assert.Equal("Software Developer Intern", result.Designation);
        Assert.True(result.ActiveStatus);

        _mockRepository.Verify(
            repo => repo.GetByIdAsync(1),
            Times.Once
        );
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenEmployeeDoesNotExist()
    {
        // Arrange
        _mockRepository
            .Setup(repo => repo.GetByIdAsync(100))
            .ReturnsAsync((Employee?)null);

        // Act
        var result = await _employeeService.GetByIdAsync(100);

        // Assert
        Assert.Null(result);

        _mockRepository.Verify(
            repo => repo.GetByIdAsync(100),
            Times.Once
        );
    }

    [Fact]
    public async Task GetByIdAsync_CallsRepositoryOnce()
    {
        // Arrange
        _mockRepository
            .Setup(repo => repo.GetByIdAsync(2))
            .ReturnsAsync((Employee?)null);

        // Act
        await _employeeService.GetByIdAsync(2);

        // Assert
        _mockRepository.Verify(
            repo => repo.GetByIdAsync(2),
            Times.Once
        );
    }



    // GANESH - POST / CREATE EMPLOYEE
   

    [Fact]
    public async Task CreateAsync_ShouldCreateEmployee_WhenEmployeeCodeIsUnique()
    {
        // Arrange
        _mockRepository
            .Setup(r => r.EmployeeCodeExistsAsync("EMP001"))
            .ReturnsAsync(false);

        _mockRepository
            .Setup(r => r.CreateAsync(It.IsAny<Employee>()))
            .ReturnsAsync((Employee employee) =>
            {
                employee.EmployeeId = 1;
                return employee;
            });

        var request = new CreateEmployeeRequest
        {
            EmployeeCode = "EMP001",
            FullName = "Rahul Sharma",
            Email = "rahul@example.com",
            Department = "IT",
            Designation = "Developer",
            JoiningDate = new DateTime(2026, 10, 1)
        };

        // Act
        var result = await _employeeService.CreateAsync(request);

        // Assert
        Assert.Equal(1, result.EmployeeId);
        Assert.Equal("EMP001", result.EmployeeCode);
        Assert.Equal("Rahul Sharma", result.FullName);
        Assert.Equal("rahul@example.com", result.Email);
        Assert.True(result.ActiveStatus);

        _mockRepository.Verify(
            r => r.CreateAsync(It.IsAny<Employee>()),
            Times.Once
        );
    }

    [Fact]
    public async Task CreateAsync_ShouldThrowException_WhenEmployeeCodeAlreadyExists()
    {
        // Arrange
        _mockRepository
            .Setup(r => r.EmployeeCodeExistsAsync("EMP001"))
            .ReturnsAsync(true);

        var request = new CreateEmployeeRequest
        {
            EmployeeCode = "EMP001",
            FullName = "Rahul Sharma",
            Email = "rahul@example.com",
            Department = "IT",
            Designation = "Developer",
            JoiningDate = new DateTime(2026, 10, 1)
        };

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _employeeService.CreateAsync(request)
        );

        // Verify employee creation was never attempted
        _mockRepository.Verify(
            r => r.CreateAsync(It.IsAny<Employee>()),
            Times.Never
        );
    }

    [Fact]
    public async Task CreateAsync_ShouldMapAllRequestFieldsToEmployee()
    {
        // Arrange
        Employee? capturedEmployee = null;

        _mockRepository
            .Setup(r => r.EmployeeCodeExistsAsync("EMP003"))
            .ReturnsAsync(false);

        _mockRepository
            .Setup(r => r.CreateAsync(It.IsAny<Employee>()))
            .Callback<Employee>(employee =>
                capturedEmployee = employee)
            .ReturnsAsync((Employee employee) => employee);

        var joiningDate = new DateTime(2026, 10, 15);

        var request = new CreateEmployeeRequest
        {
            EmployeeCode = "EMP003",
            FullName = "Priya Kumar",
            Email = "priya@example.com",
            Department = "HR",
            Designation = "HR Executive",
            JoiningDate = joiningDate
        };

        // Act
        await _employeeService.CreateAsync(request);

        // Assert
        Assert.NotNull(capturedEmployee);
        Assert.Equal("EMP003", capturedEmployee.EmployeeCode);
        Assert.Equal("Priya Kumar", capturedEmployee.FullName);
        Assert.Equal("priya@example.com", capturedEmployee.Email);
        Assert.Equal("HR", capturedEmployee.Department);
        Assert.Equal("HR Executive", capturedEmployee.Designation);
        Assert.Equal(joiningDate, capturedEmployee.JoiningDate);
        Assert.True(capturedEmployee.ActiveStatus);
    }


  
    // HARI - PUT / UPDATE EMPLOYEE
   

    [Fact]
    public async Task UpdateAsync_ValidEmployee_ReturnsTrue()
    {
        // Arrange
        var existingEmployee = new Employee
        {
            EmployeeId = 101,
            EmployeeCode = "EMP101",
            FullName = "Arun Kumar",
            Email = "arun@gmail.com",
            Department = "IT",
            Designation = "Developer",
            JoiningDate = new DateTime(2025, 1, 15),
            ActiveStatus = true
        };

        var request = new UpdateEmployeeRequest
        {
            EmployeeCode = "EMP101",
            FullName = "Arun Raj",
            Email = "arunraj@gmail.com",
            Department = "HR",
            Designation = "Senior Developer",
            JoiningDate = new DateTime(2025, 2, 15),
            ActiveStatus = true
        };

        _mockRepository
            .Setup(r => r.GetByIdAsync(101))
            .ReturnsAsync(existingEmployee);

        _mockRepository
            .Setup(r => r.UpdateAsync(It.IsAny<Employee>()))
            .ReturnsAsync(true);

        // Act
        var result = await _employeeService.UpdateAsync(101, request);

        // Assert
        Assert.True(result);

        _mockRepository.Verify(
            r => r.GetByIdAsync(101),
            Times.Once
        );

        _mockRepository.Verify(
            r => r.UpdateAsync(It.Is<Employee>(e =>
                e.EmployeeId == 101 &&
                e.FullName == "Arun Raj" &&
                e.Department == "HR" &&
                e.Email == "arunraj@gmail.com")),
            Times.Once
        );
    }

    [Fact]
    public async Task UpdateAsync_EmployeeNotFound_ReturnsFalse()
    {
        // Arrange
        _mockRepository
            .Setup(r => r.GetByIdAsync(999))
            .ReturnsAsync((Employee?)null);

        var request = new UpdateEmployeeRequest();

        // Act
        var result = await _employeeService.UpdateAsync(999, request);

        // Assert
        Assert.False(result);

        _mockRepository.Verify(
            r => r.UpdateAsync(It.IsAny<Employee>()),
            Times.Never
        );
    }

    [Fact]
    public async Task UpdateAsync_RepositoryReturnsFalse_ReturnsFalse()
    {
        // Arrange
        var existingEmployee = new Employee
        {
            EmployeeId = 101,
            EmployeeCode = "EMP101",
            FullName = "Arun Kumar",
            Email = "arun@gmail.com",
            Department = "IT",
            Designation = "Developer",
            JoiningDate = new DateTime(2025, 1, 15),
            ActiveStatus = true
        };

        var request = new UpdateEmployeeRequest
        {
            EmployeeCode = "EMP101",
            FullName = "Arun Raj",
            Email = "arunraj@gmail.com",
            Department = "HR",
            Designation = "Senior Developer",
            JoiningDate = new DateTime(2025, 2, 15),
            ActiveStatus = true
        };

        _mockRepository
            .Setup(r => r.GetByIdAsync(101))
            .ReturnsAsync(existingEmployee);

        _mockRepository
            .Setup(r => r.UpdateAsync(It.IsAny<Employee>()))
            .ReturnsAsync(false);

        // Act
        var result = await _employeeService.UpdateAsync(101, request);

        // Assert
        Assert.False(result);

        _mockRepository.Verify(
            r => r.UpdateAsync(It.IsAny<Employee>()),
            Times.Once
        );
    }

    [Fact]
    public async Task UpdateAsync_UpdatesAllProperties()
    {
        // Arrange
        var existingEmployee = new Employee
        {
            EmployeeId = 101,
            EmployeeCode = "EMP101",
            FullName = "Arun Kumar",
            Email = "arun@gmail.com",
            Department = "IT",
            Designation = "Developer",
            JoiningDate = new DateTime(2025, 1, 15),
            ActiveStatus = true
        };

        var request = new UpdateEmployeeRequest
        {
            EmployeeCode = "EMP102",
            FullName = "Arun Raj",
            Email = "arunraj@gmail.com",
            Department = "HR",
            Designation = "Senior Developer",
            JoiningDate = new DateTime(2025, 2, 15),
            ActiveStatus = false
        };

        _mockRepository
            .Setup(r => r.GetByIdAsync(101))
            .ReturnsAsync(existingEmployee);

        _mockRepository
            .Setup(r => r.UpdateAsync(It.IsAny<Employee>()))
            .ReturnsAsync(true);

        // Act
        var result = await _employeeService.UpdateAsync(101, request);

        // Assert
        Assert.True(result);

        _mockRepository.Verify(
            r => r.UpdateAsync(It.Is<Employee>(e =>
                e.EmployeeId == 101 &&
                e.EmployeeCode == "EMP102" &&
                e.FullName == "Arun Raj" &&
                e.Email == "arunraj@gmail.com" &&
                e.Department == "HR" &&
                e.Designation == "Senior Developer" &&
                e.JoiningDate == new DateTime(2025, 2, 15) &&
                e.ActiveStatus == false)),
            Times.Once
        );
    }

    [Fact]
    public async Task DeleteEmployeeAsync_ValidId_ReturnsTrue()
    {
        // Arrange
        var mockRepository = new Mock<IEmployeeRepository>();

        mockRepository
            .Setup(r => r.DeleteAsync(101))
            .ReturnsAsync(true);

        var service = new EmployeeService(mockRepository.Object);

        // Act
        var result = await service.DeleteEmployeeAsync(101);

        // Assert
        Assert.True(result);

        mockRepository.Verify(
            r => r.DeleteAsync(101),
            Times.Once);
    }

    [Fact]
    public async Task DeleteEmployeeAsync_EmployeeNotFound_ReturnsFalse()
    {
        // Arrange
        var mockRepository = new Mock<IEmployeeRepository>();

        mockRepository
            .Setup(r => r.DeleteAsync(999))
            .ReturnsAsync(false);

        var service = new EmployeeService(mockRepository.Object);

        // Act
        var result = await service.DeleteEmployeeAsync(999);

        // Assert
        Assert.False(result);

        mockRepository.Verify(
            r => r.DeleteAsync(999),
            Times.Once);
    }

    [Fact]
    public async Task DeleteEmployeeAsync_InvalidId_ReturnsFalse()
    {
        // Arrange
        var mockRepository = new Mock<IEmployeeRepository>();

        var service = new EmployeeService(mockRepository.Object);

        // Act
        var result = await service.DeleteEmployeeAsync(0);

        // Assert
        Assert.False(result);

        mockRepository.Verify(
            r => r.DeleteAsync(It.IsAny<int>()),
            Times.Never);
    }
}