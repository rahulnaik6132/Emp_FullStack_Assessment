# Employee Management System (Frontend - Angular)

A modern, responsive, and robust **Employee Management System** built with **Angular (Standalone Components, Reactive Forms, Zoneless Change Detection)** designed to integrate seamlessly with an **ASP.NET Core Web API** and **SQL Server**.

---

## 📌 Functional Requirements Covered

- [x] **Display All Employees**: Responsive tabular view with status indicators, department badges, and formatted dates.
- [x] **Add New Employee**: Comprehensive reactive form with field-level required and format validation.
- [x] **Edit Employee Details**: Loads existing record by ID and updates details with full validation.
- [x] **Delete Employee**: User confirmation prompt before calling the `DELETE` API endpoint.
- [x] **Search & Filter**:
  - Live search by **Employee Name** or **Employee Code** (e.g., `EMP001`).
  - Dropdown filter by **Department** (IT, HR, Finance, Marketing, Operations, QA).
  - Dropdown filter by **Employment Status** (Active / Inactive).
- [x] **State Handling**: Loading spinners, empty states, error alerts with retry triggers, and dismissible success banners.
- [x] **Unit Testing**: 28 executable unit tests covering components, services, forms, validation, and routes.
- [x] **Responsive Design**: Adapts cleanly across Mobile ($\le 640\text{px}$), Tablet ($768\text{px} - 1024\text{px}$), and Desktop ($1400\text{px}+$) with an off-canvas mobile drawer.

---

## 🏗️ Architecture & Project Structure

The project strictly follows standard Angular architectural patterns with clear separation of concerns:

```text
src/
├── app/
│   ├── core/
│   │   ├── models/
│   │   │   └── employee.model.ts        # Employee interface & Department definitions
│   │   └── services/
│   │       ├── employee.service.ts      # REST API client connecting to .NET API
│   │       └── employee.service.spec.ts # Unit tests for HTTP operations
│   ├── features/
│   │   ├── dashboard/                   # Workforce metrics, statistics & recent staff
│   │   │   ├── dashboard.ts
│   │   │   ├── dashboard.html
│   │   │   ├── dashboard.css
│   │   │   └── dashboard.spec.ts
│   │   └── employees/
│   │       ├── employee-list/           # List, search, filter, delete confirmation, view modal
│   │       │   ├── employee-list.ts
│   │       │   ├── employee-list.html
│   │       │   ├── employee-list.css
│   │       │   └── employee-list.spec.ts
│   │       ├── employee-form/           # Add/Edit reactive form with client validation
│   │       │   ├── employee-form.ts
│   │       │   ├── employee-form.html
│   │       │   ├── employee-form.css
│   │       │   └── employee-form.spec.ts
│   │       └── employee-detail/         # Detailed profile view (/employees/:id)
│   │           ├── employee-detail.ts
│   │           ├── employee-detail.html
│   │           ├── employee-detail.css
│   │           └── employee-detail.spec.ts
│   ├── shared/
│   │   └── components/
│   │       ├── navbar/                  # Responsive top header with mobile hamburger toggle
│   │       └── sidebar/                 # Navigation menu with off-canvas drawer support
│   ├── app.routes.ts                    # Routing configuration
│   ├── app.config.ts                    # Zoneless change detection & HttpClient providers
│   ├── app.ts / app.html / app.css      # App root layout
├── environments/
│   └── environment.ts                   # Backend API base URL configuration
├── db.json                              # Mock employee data (for standalone/offline testing)
├── angular.json
├── package.json
└── tsconfig.json
```

---

## 🔌 API Endpoints Mapping

The `EmployeeService` interfaces with the following ASP.NET Core endpoints:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/employees` | Fetches all employee records |
| `GET` | `/api/employees/{id}` | Fetches a single employee by ID |
| `POST` | `/api/employees` | Creates a new employee |
| `PUT` | `/api/employees/{id}` | Updates existing employee details |
| `DELETE` | `/api/employees/{id}` | Deletes an employee record |

### Backend API URL Configuration
The backend endpoint is configured in `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api' // Update to match your ASP.NET Core port (e.g., https://localhost:7001/api)
};
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Frontend Development Server
```bash
npm start
```
Navigate your browser to `http://localhost:4200/`.

### 3. Run Unit Tests
```bash
npm test -- --watch=false
```
All **28 tests** across **8 test files** execute and verify components, services, forms, and validation.

### 4. Build for Production
```bash
npm run build
```
Creates an optimized production bundle inside `dist/`.

---

## 🗄️ Database Reference Script (SQL Server)

For the backend database setup in SQL Server, use the schema below:

```sql
CREATE DATABASE EmployeeManagementDb;
GO

USE EmployeeManagementDb;
GO

CREATE TABLE Employees (
    EmployeeId INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeCode NVARCHAR(20) NOT NULL UNIQUE,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(150) NOT NULL,
    Department NVARCHAR(50) NOT NULL,
    Designation NVARCHAR(50) NOT NULL,
    JoiningDate DATE NOT NULL,
    activeStatus BIT NOT NULL DEFAULT 1
);
GO

-- Seed initial test employees
INSERT INTO Employees (EmployeeCode, FullName, Email, Department, Designation, JoiningDate, activeStatus)
VALUES 
('EMP001', 'Alexander Wright', 'alexander.wright@company.com', 'Information Technology', 'Principal Software Engineer', '2021-03-15', 1),
('EMP002', 'Sophia Martinez', 'sophia.m@company.com', 'Human Resources', 'Senior HR Manager', '2021-08-01', 1),
('EMP003', 'Marcus Chen', 'marcus.c@company.com', 'Finance & Accounting', 'Lead Financial Analyst', '2022-01-10', 1);
GO
```

---

## 💡 Review & Demonstration Guide (Speaking Points for Reviewer)

When presenting this project to the technical reviewer, here is how you can explain your implementation:

1. **Angular Standalone Architecture**:
   - Built with modern Angular standalone components (`standalone: true`), eliminating legacy `NgModule` boilerplate and improving tree-shaking.
2. **Zoneless Change Detection**:
   - Uses `provideZonelessChangeDetection()` paired with explicit `ChangeDetectorRef.markForCheck()` in subscription callbacks, ensuring instant UI updates upon API responses without reliance on Zone.js.
3. **Reactive Forms & Robust Validation**:
   - Utilizes `FormBuilder` with required-field, min-length, alphanumeric pattern, and email validators.
   - User feedback is clean: error hints appear only when fields are `touched` and `invalid`.
4. **Resilience & UX**:
   - Full empty states when records are missing or filtered out.
   - Safety delete confirmation prompt protects against accidental deletion.
   - Error banners with inline "Retry" handlers let users recover easily if the backend is temporarily offline.
5. **Responsiveness**:
   - Features a sliding navigation drawer on mobile and responsive table scroll containers for high readability on any device.
