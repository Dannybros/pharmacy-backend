import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    birthday:String,
    username:String,
    password:String,
    hint:String
})

const UserCollection = mongoose.model('users', userSchema);

export default UserCollection;