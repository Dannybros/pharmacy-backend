
import mongoose from 'mongoose'

const itemSchema = new mongoose.Schema({
    name:{
        en:String,
        la:String
    },
    type:{
        en:String,
        la:String
    },
    quantity:Number,
    price:Number,
    weight:String,
    brand:String,
    description:{
        en:String,
        la:String
    },
    expireDate:String,
    img:String
})

const ItemCollection = mongoose.model('items', itemSchema);

export default ItemCollection;