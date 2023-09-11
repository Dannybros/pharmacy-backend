
import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
    Name:{
        en:String,
        la:String
    },
})

const CategoryCollection = mongoose.model('categories', categorySchema);

export default CategoryCollection;