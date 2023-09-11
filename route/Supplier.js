import express from 'express'
import SupplierCollection from '../model/SupplierModel.js';

const router = express.Router();

router.get('/', (req, res)=>{
    SupplierCollection.find({}, (err, data)=>{
        if(err){
            res.status(500).send(err);
        }else{
            res.status(201).send(data);
        }
    })
})

router.post('/delete', (req,res)=>{
    const {id} = req.body;
    SupplierCollection.find({_id: id}, (err, data)=>{
        if(err){
            res.status(500).json({error:err});
        }else{
            res.status(201).send({message:"Deleted Successfully"});
            
        }
    }).deleteOne();
})

router.post('/update', (req,res)=>{
    const {_id, name, phone, email} = req.body;

    if(name==""){
        res.status(400).json({
            message:"Please fill in all the fields"
        });
    }

    SupplierCollection.findByIdAndUpdate(_id, {
        name,
        phone,
        email
    }, ({new:true}), (err, data)=>{
        if(err){
            res.status(500).json({error:err});
        }else{
            res.status(201).json({data:data, message:"Updated Successfully"});
        }
    })

})

router.post('/', (req, res)=>{
    const {name, phone, email} = req.body;
    
    if(name==""){
        res.status(400).json({
            message:"Please fill in all the fields"
        });
    }

    const supplier = new SupplierCollection({
        name:name,
        phone:Number(phone),
        email:email
    })

    supplier.save()
    .then(result=>{
        res.status(201).json({
            message:"Supplier registered successfully",
            data:result
        })
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        });
    });
})

export default router;