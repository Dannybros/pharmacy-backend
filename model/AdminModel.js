
import mongoose from 'mongoose'

const adminsSchema = new mongoose.Schema({
    username:String,
    password:String,
    adminID:String
})

const AdminCollection = mongoose.model('admins', adminsSchema);

export default AdminCollection;