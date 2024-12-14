import { errorHandler } from "../middleware/error.js";
import Employee from "../models/employee.model.js";

export const createEmployee = async (req, res, next) => {
  try {
    const { employeeId, company } = req.body;
    const existingEmployee = await Employee.findOne({ employeeId, company });

    if (existingEmployee) {
      return next(errorHandler(
        400,
         "Employee ID already exists in this company",
      ));
    }

    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.body;
    const existingEmployee = await Employee.findOne({
      employeeId,
      _id: { $ne: req.params.id },
    });
    if (existingEmployee) {
      return next(errorHandler(
        400,
         "Employee ID already exists",
      ));
    }

    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("reportingManager", "name employeeId");
    if (!employee) {
      return next(errorHandler(
        404,
         "Employee not found",
      ));
    }
    res.json(employee);
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return next(errorHandler(
        404,
         "Employee not found",
      ));
    }
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const searchEmployees = async (req, res, next) => {
  try {
    const { company, query } = req.query;
    const employees = await Employee.find({
      company,
      $or: [
        { name: new RegExp(query, "i") },
        { employeeId: new RegExp(query, "i") },
        { phoneNumber: new RegExp(query, "i") },
        { reportingManager: new RegExp(query, "i") },
      ],
    }).populate("reportingManager", "name employeeId");
    res.json(employees);
  } catch (error) {
    next(error);
  }
};

export const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id).populate(
      "reportingManager",
      "name employeeId"
    );
    if (!employee) {
      return next(errorHandler(
        404,
         "Employee not found",
      ));
    }
    res.json(employee);
  } catch (error) {
    next(error);
  }
};
