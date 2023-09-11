
import mongoose from 'mongoose'

const adminsSchema = new mongoose.Schema({
    username:String,
    password:String,
    // adminType:String,
    adminID:String
})

const AdminsCollection = mongoose.model('admins', adminsSchema);

export default AdminsCollection;