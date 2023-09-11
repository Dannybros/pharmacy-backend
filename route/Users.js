import express from 'express'
import UserCollection from '../model/UserModel.js';
import AdminsCollection from '../model/adminsModel.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import * as EmailValidator from 'email-validator';
import EmployeeCollection from '../model/EmployeeModel.js';
import ImportCollection from '../model/ImportModel.js';
import ItemCollection from '../model/ItemModel.js';
import CategoryCollection from '../model/CategoryModel.js';
import OrderCollection from '../model/OrderModel.js';

const router = express.Router();
dotenv.config();

router.get('/home', async(req, res)=>{
   const employees = await EmployeeCollection.countDocuments({});
   const customers = await UserCollection.countDocuments({});
   const items = await ItemCollection.countDocuments({});
   const types = await CategoryCollection.countDocuments({});
   const importChecked = await ImportCollection.countDocuments({status: "Checked"})
   const importCancel = await ImportCollection.countDocuments({status: "Cancelled"})
   const importPending = await ImportCollection.countDocuments({status: "Pending"})
   const orderChecked = await OrderCollection.countDocuments({'status.en': "Completed"})
   const orderCancel = await OrderCollection.countDocuments({status: "Cancelled"})
   const orderPending = await OrderCollection.countDocuments({status: "Pending"})

    res.status(200).json({
        emp: employees, 
        cust: customers, 
        items: items, 
        types: types, 
        importChecked: importChecked, 
        importCancel:importCancel,
        importPending:importPending,
        orderChecked: orderChecked,
        orderCancel:orderCancel,
        orderPending:orderPending
    })
})

router.post('/admin/login', async(req, res)=>{
    const {username, password} = req.body;

    const existingUser = await AdminsCollection.findOne({username: username});

    if(!existingUser) return res.status(403).json({status:"error", message:"Username or Password is incorrect"})
    
    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password); 

    if(!isPasswordCorrect) return res.status(403).json({status:"error", message:"Username or Password is incorrect"})

    // //require('crypto').randomBytes(64).toString('hex') from git bash -> type "node" first
    const secret_key = process.env.JWTAUTHKEY

    const user = await {name:username, id:existingUser.adminID}

    const token = jwt.sign(user, secret_key, {expiresIn: '5h' });

     await res.json({status:"success", token:token})
})

router.get('/get-all', (req, res)=>{
    UserCollection.find({}, (err, data)=>{
        if(err){
            res.status(500).send(err);
        }else{
            res.status(201).send(data);
        }
    })
})

router.post('/login', async (req, res)=>{
    const {username, password} = req.body;

    if( username=='' || password==''){
        return res.status(400).json({message: "Please fil in all the fields."});
    }

    try{
        const existingUser = await UserCollection.findOne({username});

        if(!existingUser) return res.status(400).json({message: "User doesn't exit."});

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

        if(!isPasswordCorrect) return res.status(400).json({message: "Password doesn't match."});

        res.status(200).json({result:existingUser});

    }catch(error){  
        res.status(401).json({message: "Something went wrong. Please Check Internet."});
    }
})

router.post('/signup', async (req, res)=>{

    const { email, bod, username, password, name, cPassword, hint } = req.body;

    if(email=='' || bod=='' || username=='' || password=='' || name=='' || cPassword=='' || hint==''){
        return res.status(400).json({message: "Please fil in all the fields"});
    }

    const validateEmail = EmailValidator.validate(email);
    
    if(!validateEmail) return res.status(400).json({message: "Email is not real!"});

    const existingEmail = await UserCollection.findOne({email});

    if(existingEmail) return res.status(400).json({message: "email already exit!"});

    const existingUser = await UserCollection.findOne({username});

    if(existingUser) return res.status(400).json({message: "User already exit!"});

    if(password !== cPassword){
        return res.json({message: "Password don't match!"});
    } 

    const hashPw= await bcrypt.hash(password, 10);

    await UserCollection.create({email, birthday:bod, username, hint, password:hashPw, name});

    res.status(201).json({message:"You have sign up successfully!"});

})

router.post('/check-user', async (req, res)=>{
    const {email, hint} = req.body;

    if( email=='' || hint==''){
        return res.status(400).json({message: "Please fil in all the fields!"});
    }

    const validateEmail = EmailValidator.validate(email);
    
    if(!validateEmail) return res.status(400).json({message: "Email is not real!"});

    const existingEmail = await UserCollection.findOne({email});

    if(!existingEmail) return res.status(400).json({message: "email doesn't exit!"});

    if(existingEmail.hint !== hint) return res.status(400).json({message: "hint is incorrect!"});

    res.status(200).json({message:"Pass"});
})

router.post('/change-pw', async (req, res)=>{
    const {password, cPassword, email} = req.body;

    if( password=='' || cPassword==''){
        return res.status(400).json({message: "Please fil in all the fields!"});
    }

    if(password !== cPassword){
        return res.json({message: "Password don't match!"});
    } 

    const hashPw= await bcrypt.hash(password, 10);

    UserCollection.findOneAndUpdate({email:email}, {password:hashPw}, ({new:true}), (err, data)=>{
        if(err){
            res.status(500).json({message:"Updated Failed. Please Try Again"})
        }else{
            res.status(201).json({message:"Updated Success"})
        }
    })
})

router.post('/update/info', async (req, res)=>{
    const {_id, email, birthday, username, pw, name, hint } = req.body;

    //check if there is empty fields
    if(email=='' || birthday=='' || username=='' || name=='' || hint==''){
        return res.status(400).json({message: "Please fil in all the fields"});
    }

    //check if email is valid of not
    const validateEmail = EmailValidator.validate(email);
    
    if(!validateEmail) return res.status(400).json({message: "Email is not real!"});

    // check if email name exist, excluding user's own email
    const existingEmail = await UserCollection.findOne(
        {
            _id: { $ne: _id },
            email
        },
    );

    if(existingEmail) return res.status(400).json({message: "email already exit!"});

    // check if email name exist, excluding user's own username
    const existingUserName = await UserCollection.findOne(
        {
            _id: { $ne: _id },
            username
        },
    );

    if(existingUserName) return res.status(400).json({message: "username already exit!"});

    const currentUser = await UserCollection.findById({_id:_id});

    let newPw;

    if(pw!=="") newPw = await bcrypt.hash(pw, 10);
    else newPw = currentUser.password;

    //update all the info except id
    UserCollection.findByIdAndUpdate(_id, {
        email,
        birthday,
        hint,
        username,
        name,
        password:newPw,
    }, ({new:true}), (err, data)=>{
        if(err){
            res.status(500).json({message:"Updated Failed. Please Try Again"})
        }else{
            res.status(201).json({data:data, message:"Updated Success"})
        }
    })
})

export default router;