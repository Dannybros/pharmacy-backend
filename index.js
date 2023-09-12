import express from "express";
import cors from 'cors';
import mongoose from "mongoose";
import dotenv from 'dotenv';
import items from './route/Items.js'
import users from './route/Users.js'
import employee from './route/Employee.js'
import category from './route/Category.js'
import supplier from './route/Supplier.js'
import order from './route/Order.js'
import imports from './route/Import.js'
import review from './route/Review.js'
import stripe from './route/Stripe.js'

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit:50000}));

const port = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
})

mongoose.connection.on("connected", ()=>{
    console.log("Mongoose is connected");
})

app.listen(port, ()=>console.log(`App is starting now in ${port}`));

app.use('/products', items);
app.use('/user', users);
app.use('/employee', employee);
app.use('/category', category);
app.use('/supplier', supplier);
app.use('/order', order);
app.use('/review', review);
app.use('/imports', imports);
app.use('/stripe', stripe);

app.get('/', (req, res)=> {
    res.status(200).send("This is pharmacy backend");
});