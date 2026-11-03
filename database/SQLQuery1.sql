
-- Step 1: Create the Database
CREATE DATABASE EmployeeManagementDB;
GO

-- Step 2: Select the Database
USE EmployeeManagementDB;
GO

-- Step 3: Create the Employees Table
CREATE TABLE Employees
(
    EmployeeId INT IDENTITY(1,1) PRIMARY KEY,

    EmployeeCode VARCHAR(20) NOT NULL UNIQUE,

    FullName VARCHAR(100) NOT NULL,

    Email VARCHAR(150) NOT NULL UNIQUE,

    Department VARCHAR(100) NOT NULL,

    Designation VARCHAR(100) NOT NULL,

    JoiningDate DATE NOT NULL,

    ActiveStatus BIT NOT NULL DEFAULT 1
);
GO




INSERT INTO Employees
(
    EmployeeCode,
    FullName,
    Email,
    Department,
    Designation,
    JoiningDate,
    ActiveStatus
)
VALUES
(
    'EMP001',
    'Rahul Naik',
    'rahul@gmail.com',
    'IT',
    'Software Developer',
    '2026-10-30',
    1
),
(
    'EMP002',
    'Amit Sharma',
    'amit@gmail.com',
    'HR',
    'HR Executive',
    '2026-10-25',
    1
);
GO

-- Step 4: Verify the Table
SELECT * FROM Employees;
GO




