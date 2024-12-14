import { errorHandler } from "../middleware/error.js";
import Company from "../models/company.model.js";
import Employee from "../models/employee.model.js";

export const createCompany = async (req, res, next) => {
  try {
    const { code} = req.body;
    const existingCompany = await Company.findOne({ code});

    if (existingCompany) {
      return next(errorHandler(
        400,
         "Company ID already exists",
      ));
    }
    const company = new Company(req.body);
    await company.save();
    res.status(201).send(company);
  } catch (error) {
    // res.status(400).send(error);
    next(error)
  }
};

export const updateCompany = async (req, res, next) => {

  try {
    const { code} = req.body;
    const existingCompany = await Company.findOne({ code});

    if (existingCompany) {
      return next(errorHandler(
        400,
         "Company ID already exists",
      ));
    }
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!company) {
      return next(errorHandler(
        400,
         "Company not found",
      ));
    }
    res.json(company);
  } catch (error) {
    res.status(400).json({ error: error.message });
    next(error)
  }
};

export const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return next(errorHandler(
        400,
         "Company not found",
      ));
    }

    await Employee.deleteMany({ company: company._id });

    await Company.findByIdAndDelete(req.params.id);

    res.json({ message: 'Company and associated employees deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
    next(error)
  }

};


export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.send(companies);
  } catch (error) {
    res.status(500).send(error);
  }
};

