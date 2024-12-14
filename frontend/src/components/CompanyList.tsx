import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { getErrorMessage } from "../utils/errorUtils";

interface Company {
  _id: string;
  name: string;
  code: string;
}

interface CompanyListProps {
  companies: Company[];
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company) => void;
  setCompanies: (companies: Company[]) => void;
  isAdmin: boolean;
}

const CompanyList: React.FC<CompanyListProps> = ({
  companies,
  selectedCompany,
  setSelectedCompany,
  setCompanies,
  isAdmin,
}) => {
  const [newCompany, setNewCompany] = useState<Omit<Company, "_id">>({
    name: "",
    code: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const navigate = useNavigate();

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newCompany.name.trim() || !newCompany.code.trim()) {
      setError("Both name and code are required.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post<Company>(
        "/companies",
        newCompany
      );
      setCompanies([...companies, response.data]);
      setNewCompany({ name: "", code: "" });
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error adding company:", err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (companyId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this company? This will also delete all associated employees."
      )
    ) {
      try {
        await axiosInstance.delete(`/companies/${companyId}`);
        setCompanies(companies.filter((c) => c._id !== companyId));
        if (selectedCompany && selectedCompany._id === companyId) {
          setSelectedCompany(null);
        }
      } catch (error) {
        console.error("Error deleting company:", error);
       setError(getErrorMessage(error));

      }
    }
  };
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;

    setError(null);
    setIsLoading(true);

    try {
      const response = await axiosInstance.put<Company>(
        `/companies/${editingCompany._id}`,
        editingCompany
      );
      setCompanies(
        companies.map((c) => (c._id === response.data._id ? response.data : c))
      );
      setEditingCompany(null);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Error updating company:", err);
      setError(getErrorMessage(err));

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="relative text-white overflow-x-auto shadow-md sm:rounded-lg mb-4">
        <div className="flex justify-between">
          <h2 className="text-2xl font-semibold mb-4">Companies</h2>
          <div>
            {isAdmin && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md mb-4 hover:bg-indigo-700 transition-colors"
              >
                + Add Company
              </button>
            )}
          </div>
        </div>

        <table className="w-full text-sm text-left rtl:text-right text-gray-800 bg-purple-100 rounded-lg shadow-lg">
          <thead className="text-xs uppercase bg-purple-600 text-white">
            <tr>
              <th scope="col" className="px-6 py-3">
                Company Name
              </th>
              <th scope="col" className="px-6 py-3">
                Code
              </th>
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr
                key={company._id}
                className="odd:bg-purple-200 even:bg-purple-300  transition duration-150 border-b border-purple-400"
              >
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                >
                  {company.name}
                </th>
                <td className="px-6 py-4">{company.code}</td>
                <td className="px-6 py-4 flex gap-1">
                  <button
                    onClick={() => navigate(`/employees/${company._id}`)}
                    className="mr-2 px-3 py-1 text-xs font-medium text-blue-800 bg-blue-200 rounded-full hover:bg-blue-300"
                  >
                    View
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleEdit(company)}
                        className="mr-2 px-3 py-1 text-xs font-medium text-green-800 bg-green-200 rounded-full hover:bg-green-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(company._id)}
                        className="px-3 py-1 text-xs font-medium text-red-800 bg-red-200 rounded-full hover:bg-red-300"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Add New Company</h3>
            <form onSubmit={handleAddCompany}>
              {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Company Name"
                  value={newCompany.name}
                  onChange={(e) =>
                    setNewCompany({ ...newCompany, name: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={isLoading}
                />
                <input
                  type="text"
                  placeholder="Company Code"
                  value={newCompany.code}
                  onChange={(e) =>
                    setNewCompany({ ...newCompany, code: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={isLoading}
                />
                <div className="flex items-center space-x-2">
                  <button
                    type="submit"
                    className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                      isLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    disabled={isLoading}
                  >
                    {isLoading ? "Adding..." : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-gray-200 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">
              {editingCompany ? "Edit Company" : "Add New Company"}
            </h3>
            <form onSubmit={editingCompany ? handleUpdate : handleAddCompany}>
              {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Company Name"
                  value={editingCompany ? editingCompany.name : newCompany.name}
                  onChange={(e) =>
                    editingCompany
                      ? setEditingCompany({
                          ...editingCompany,
                          name: e.target.value,
                        })
                      : setNewCompany({ ...newCompany, name: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={isLoading}
                />
                <input
                  type="text"
                  placeholder="Company Code"
                  value={editingCompany ? editingCompany.code : newCompany.code}
                  onChange={(e) =>
                    editingCompany
                      ? setEditingCompany({
                          ...editingCompany,
                          code: e.target.value,
                        })
                      : setNewCompany({ ...newCompany, code: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={isLoading}
                />
                <div className="flex items-center space-x-2">
                  <button
                    type="submit"
                    className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                      isLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    disabled={isLoading}
                  >
                    {isLoading
                      ? "Saving..."
                      : editingCompany
                      ? "Update"
                      : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingCompany(null);
                    }}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-gray-200 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyList;
