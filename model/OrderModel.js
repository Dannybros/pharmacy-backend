
import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    customerID:String,
    customerName:String,
    customerPhone:Number,
    customerAddress:{
        addr:String,
        coords:{
            lat:String,
            lng:String
        }
    },
    orderItems:{ type : Array , "default" : [] },
    orderTotal:Number,
    paymentMethod:String,
    status:{
        en:String,
        la:String
    },
    checked:{
        type: Boolean,
        default: false
    },
    employeeName:String
}, { timestamps: true })

const OrderCollection = mongoose.model('orders', orderSchema);

export default OrderCollection;