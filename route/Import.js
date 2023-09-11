import express from 'express'
import ImportCollection from '../model/ImportModel.js';
import ItemCollection from '../model/ItemModel.js';

const router = express.Router();

router.get('/', (req, res)=>{
    ImportCollection.find({}, (err, data)=>{
        if(err){
            res.status(500).send(err);
        }else{
            res.status(201).send(data);
        }
    })
})

router.get('/pending', (req, res)=>{
    ImportCollection.find({status:"Pending"}, (err, data)=>{
        if(err){
            res.status(500).send(err);
        }else{
            res.status(201).send(data);
        }
    })
})

router.get('/revenue/checked', async(req, res)=>{
   const checkedImports= await ImportCollection.find({status:"Checked"});

   if(!checkedImports) return res.status(400).json({message: "No Import has been checked"});

   const filterImport = await checkedImports.map((imp)=>{
    return {id:imp._id, total:imp.subtotal, date:imp.updatedAt}
   })

   if(!filterImport) return res.status(400).json({message: "Something Went Wrong"});

   res.status(201).send(filterImport)
})

router.post('/check', async(req, res)=>{
    const {imports} = req.body

    await imports.importItems.map((item)=>{
        try {
            ItemCollection.findByIdAndUpdate({_id:item._id}, {$inc:{quantity: item.importAmount}}, (err, data)=>{
                if(err){
                    res.status(400).send(error.message)
                }
            })
        } catch (error) {
            res.status(400).send(error.message);
        }
    })

    ImportCollection.findByIdAndUpdate({_id:imports._id}, {status:"Checked"}, ({new:true}), (err, data)=>{
        if(err){
            res.status(500).json({error:err});
        }else{
            res.status(200).json({message:"import checked successfully"});
            req.io.emit("import-update",{data:data});
            req.io.emit("update-product", {data:data})
        }
    })
})


router.post('/cancel', (req, res)=>{
    const {imports} = req.body

    ImportCollection.findByIdAndUpdate({_id:imports._id}, {status:"Cancelled"}, ({new:true}), (err, data)=>{
        if(err){
            res.status(500).json({error:err});
        }else{
            res.status(200).json({message:"import cancelled successfully"});
            req.io.emit("import-update",{data:data});
            req.io.emit("update-product", {data:data})
        }
    })
})

router.post('/', async(req, res)=>{

    const {supp, items, subtotal} = req.body;



    new ImportCollection({
        supplierName:supp,
        importItems:items,
        subtotal:subtotal
    }).save()
    .then(result=>{
        res.status(201).json({
            message:"New Import Ordered Successfully"
        })
        
        req.io.emit("new-import",{data:result});
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        });
    });
    
})

export default router;