import express from 'express'
import CategoryCollection from '../model/CategoryModel.js';

const router = express.Router();

router.get('/', (req, res)=>{
    CategoryCollection.find({}, (err, data)=>{
        if(err){
            res.status(500).send(err);
        }else{
            res.status(201).send(data);
        }
    })
})

router.post('/delete', (req,res)=>{
    const {id} = req.body;
    CategoryCollection.find({_id: id}, (err, data)=>{
        if(err){
            res.status(500).json({error:err});
        }else{
            res.status(201).send({message:"Deleted Successfully"});
            
        }
    }).deleteOne();
})

router.post('/update', (req,res)=>{
    const {_id, Name} = req.body;

    if(Name.en==="" || Name.la===""){
        res.status(400).json({
            message:"Please fill in all the fields"
        });
    }

    CategoryCollection.findByIdAndUpdate(_id, {Name:Name}, ({new:true}), (err, data)=>{
        if(err){
            res.status(500).json({error:err});
        }else{
            res.status(201).json({data:data, message:"Updated Successfully"});
        }
    })

})

router.post('/', (req, res)=>{
    const {Name} = req.body;
    
    if(Name.en==="" || Name.la===""){
        res.status(400).json({
            message:"Please fill in all the fields"
        });
    }

    const category = new CategoryCollection({Name})

    category.save()
    .then(result=>{
        res.status(201).json({
            message:"Employee registered successfully",
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