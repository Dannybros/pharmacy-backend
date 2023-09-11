
import mongoose from 'mongoose'

const importSchema = new mongoose.Schema({
    subtotal:Number,
    importItems:{ type : Array , default : [] },
    supplierName:String,
    status:{ type:String, default:"Pending" },
}, { timestamps: { createdAt: 'importDate' } })

const ImportCollection = mongoose.model('imports', importSchema);

export default ImportCollection;