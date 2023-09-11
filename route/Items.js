import express from 'express'
import ItemCollection from '../model/ItemModel.js';

const router = express.Router();

router.get('/', (req, res)=>{
    ItemCollection.find({}, (err, data)=>{
        if(err){
            res.status(500).send(err);
        }else{
            res.status(201).send(data);
        }
    })
})

router.post('/get-one', (req, res)=>{
    const {id} = req.body
    ItemCollection.find({_id:id}, (err, data)=>{
        if(err){
            res.status(500).send(err);
        }else{
            res.status(201).send(data);
        }
    })
})

router.post('/delete', (req,res)=>{
    const {id} = req.body;
    ItemCollection.find({_id: id}, (err, data)=>{
        if(err){
            res.status(500).json({error:err});
        }else{
            res.status(201).send({message:"Deleted Successfully"});
            req.io.emit("delete-product", {id:id});
        }
    }).deleteOne();
})


router.post('/update', (req,res)=>{
    const {_id, name, type, price, brand, weight, quantity, description, expireDate, imgUrl} = req.body;

    if(name.en=="" || name.la=="" || type.en=="" || type.la=="" || price=="" || brand=="" || weight=="" || quantity=="" || description.en=="" || description.la=="" || expireDate=="" || imgUrl==""){
        res.status(400).json({
            message:"Please fill in all the fields"
        })
    }else{
        ItemCollection.findByIdAndUpdate(_id, {
            name:name,
            type:type,
            quantity:Number(quantity),
            price:Number(price),
            weight:weight,
            brand:brand,
            description:description,
            expireDate:expireDate,
            img:imgUrl
        }, ({new:true}), (err, data)=>{
            if(err){
                res.status(500).json({message:"Updated Failed. Please Try Again"})
            }else{
                res.status(201).json({message:"Updated Success", data:data})
                req.io.emit("update-product", {data:data});
            }
        })
    }
})

router.post('/', async(req, res)=>{

    const {name, type, price, brand, weight, quantity, description, expireDate, imgUrl} = req.body

    if(name.en=="" || name.la=="" || type.en=="" || type.la=="" || price=="" || brand=="" || weight=="" || quantity=="" || description.en=="" || description.la=="" || expireDate=="" || imgUrl==""){
        res.status(400).json({
            message:"Please fill in all the fields"
        });
    }else{
        ItemCollection({
            name:name,
            type:type,
            quantity:Number(quantity),
            price:Number(price),
            weight:weight,
            brand:brand,
            description:description,
            expireDate:expireDate,
            img:imgUrl
        }).save()
        .then(result=>{
            req.io.emit("new-products",{data:result});

            res.status(201).json({
                message:"New Medicine registered successfully",
                data:result
            })
        })
        .catch(err=>{
            res.status(500).json({
                error:err
            });
        });
    }

})

export default router;