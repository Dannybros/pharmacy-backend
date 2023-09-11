import mongoose from 'mongoose'

const employeeSchema = new mongoose.Schema({
    EmployeeName:String,
    Gender:String,
    BOD:String,
    Phone:Number,
    Joining_Date:String,
    Salary:Number,
})

const EmployeeCollection = mongoose.model('employee', employeeSchema);

export default EmployeeCollection;