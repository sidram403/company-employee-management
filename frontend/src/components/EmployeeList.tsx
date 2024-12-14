import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit, Trash2 } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import { getErrorMessage } from "../utils/errorUtils";

interface Employee {
  _id: string;
  name: string;
  employeeId: string;
  phoneNumber: string;
  reportingManager: string | null;
}

interface NewEmployee {
  name: string;
  employeeId: string;
  phoneNumber: string;
  reportingManager: string;
}

interface EmployeeListProps {
  isAdmin: boolean;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ isAdmin }) => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newEmployee, setNewEmployee] = useState<NewEmployee>({
    name: "",
    employeeId: "",
    phoneNumber: "",
    reportingManager: "",
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (companyId) {
      fetchEmployees();
    }
  }, [companyId, searchQuery]);

  const fetchEmployees = async () => {
    try {
      const response = await axiosInstance.get<Employee[]>(
        "/employees/search",
        {
          params: { company: companyId, query: searchQuery },
        }
      );
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setError(getErrorMessage(error));
    }
  };

  const handleAddEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axiosInstance.post<Employee>("/employees", {
        ...newEmployee,
        company: companyId,
        reportingManager: newEmployee.reportingManager || null,
      });
      setEmployees((prevEmployees) => [...prevEmployees, response.data]);
      setNewEmployee({
        name: "",
        employeeId: "",
        phoneNumber: "",
        reportingManager: "",
      });
      setIsAddPopupOpen(false);
    } catch (error) {
      console.error("Error adding employee:", error);
      setError(getErrorMessage(error));
    }
  };

  const handleUpdateEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingEmployee) return;

    setError(null);
    try {
      const response = await axiosInstance.put<Employee>(
        `/employees/${editingEmployee._id}`,
        {
          ...editingEmployee,
        }
      );
      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp._id === response.data._id ? response.data : emp
        )
      );
      setIsEditPopupOpen(false);
      setEditingEmployee(null);
    } catch (error) {
      console.error("Error updating employee:", error);
      setError(getErrorMessage(error));
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await axiosInstance.delete(`/employees/${employeeId}`);
        setEmployees((prevEmployees) =>
          prevEmployees.filter((emp) => emp._id !== employeeId)
        );
      } catch (error) {
        console.error("Error deleting employee:", error);
        setError(getErrorMessage(error));
      }
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsEditPopupOpen(true);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="max-w-7xl h-screen mx-auto py-6 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:ring-indigo-500 focus:border-indigo-500"
      >
        Back
      </button>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search employees..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-2/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        {isAdmin && (
          <button
            onClick={() => setIsAddPopupOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            + Add Employee
          </button>
        )}
      </div>


      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-800 bg-purple-100 rounded-lg shadow-lg">
          <thead className="text-xs uppercase bg-purple-600 text-white">
            <tr>
              <th scope="col" className="px-6 py-3">
                Employee Name
              </th>
              <th scope="col" className="px-6 py-3">
                Employee Id
              </th>
              <th scope="col" className="px-6 py-3">
                Phone Number
              </th>
              <th scope="col" className="px-6 py-3">
                Reporting Manager
              </th>
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr
                key={employee._id}
                className="odd:bg-purple-200 even:bg-purple-300  transition duration-150 border-b border-purple-400"
              >
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                >
                  {employee.name}
                </th>
                <td className="px-6 py-4">{employee.employeeId}</td>
                <td className="px-6 py-4">{employee.phoneNumber}</td>
                <td className="px-6 py-4">
                  {employee.reportingManager
                    ? employee.reportingManager
                    : "Null"}
                </td>
                <td className="px-6 py-4 flex gap-1">
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleEditEmployee(employee)}
                        className="text-blue-600 hover:underline"
                      >
                        <Edit />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee._id)}
                        className="text-red-600 hover:underline"
                      >
                        <Trash2 />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAddPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-1/3">
            <h2 className="text-lg font-bold mb-4">Add Employee</h2>
            {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

            <form onSubmit={handleAddEmployee} className="space-y-4">
              <input
                type="text"
                placeholder="Employee Name"
                value={newEmployee.name}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <input
                type="text"
                placeholder="Employee ID"
                value={newEmployee.employeeId}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, employeeId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={newEmployee.phoneNumber}
                onChange={(e) =>
                  setNewEmployee({
                    ...newEmployee,
                    phoneNumber: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <select
                value={newEmployee.reportingManager || ""}
                onChange={(e) =>
                  setNewEmployee({
                    ...newEmployee,
                    reportingManager: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Reporting Manager ID (optional)</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee.employeeId}>
                    {employee.name} ({employee.employeeId})
                  </option>
                ))}
              </select>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddPopupOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditPopupOpen && editingEmployee && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-1/3">
            <h2 className="text-lg font-bold mb-4">Edit Employee</h2>
            {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

            <form onSubmit={handleUpdateEmployee} className="space-y-4">
              <input
                type="text"
                placeholder="Employee Name"
                value={editingEmployee.name}
                onChange={(e) =>
                  setEditingEmployee({
                    ...editingEmployee,
                    name: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <input
                type="text"
                placeholder="Employee ID"
                value={editingEmployee.employeeId}
                onChange={(e) =>
                  setEditingEmployee({
                    ...editingEmployee,
                    employeeId: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={editingEmployee.phoneNumber}
                onChange={(e) =>
                  setEditingEmployee({
                    ...editingEmployee,
                    phoneNumber: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <input
                type="text"
                placeholder="Reporting Manager ID (optional)"
                value={editingEmployee.reportingManager || ""}
                onChange={(e) =>
                  setEditingEmployee({
                    ...editingEmployee,
                    reportingManager: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditPopupOpen(false);
                    setEditingEmployee(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
