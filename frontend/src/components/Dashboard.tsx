import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import CompanyList from "./CompanyList";

interface Company {
  _id: string;
  name: string;
  code: string;
}

const Dashboard: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get("/companies");
      setCompanies(response.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-indigo-600">
                  Company-Employee System
                </h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-gray-700">
                Welcome, <span className="font-semibold">{user?.fullName}</span>{" "}
                <span className="text-sm text-gray-500">({user?.role})</span>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-transparent rounded-lg overflow-hidden">
            <div className="p-6">
              {/* <h2 className="text-2xl font-semibold text-gray-800 mb-6">Companies</h2> */}
              <CompanyList
                companies={companies}
                setCompanies={setCompanies}
                selectedCompany={selectedCompany}
                setSelectedCompany={setSelectedCompany}
                isAdmin={user?.role === "ADMIN"}
              />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
