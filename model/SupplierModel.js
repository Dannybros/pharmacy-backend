import mongoose from 'mongoose'

const id =  mongoose.Types.ObjectId();

const supplierSchema = new mongoose.Schema({
    name:String,
    phone:Number,
    email:String,
})

const SupplierCollection = mongoose.model('supplier', supplierSchema);

export default SupplierCollection;