import mongoose from "mongoose";
const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  employeeId: { type: String, required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  phoneNumber: { type: String, required: true },
  reportingManager: {
    type: String,
    default: null
  },
});

employeeSchema.index({ company: 1, employeeId: 1 }, { unique: true });

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
