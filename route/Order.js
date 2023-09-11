import express from 'express'
import OrderCollection from '../model/OrderModel.js';
import ItemCollection from '../model/ItemModel.js';

const router = express.Router();

router.get('/', (req, res)=>{
    OrderCollection.find({}).sort({createdAt:-1}).exec((err, data)=>{
        if(err){
            res.status(500).send(err);
        }else{
            res.status(201).send(data);
        }
    })
})

router.get('/pending', (req, res)=>{
    OrderCollection.find({'status.en':"Pending"}).sort({_id:-1}).exec((err, data)=>{
        if(err){
            res.status(500).send(err);
        }else{
            res.status(201).send(data);
        }
    })
})

router.get('/revenue/complete', async(req, res)=>{
    const completedOrders = await OrderCollection.find({'status.en':"Completed"});

    if(!completedOrders) return res.status(400).json({message: "No Orders has been completed yet"});

    const filterOrders = await completedOrders.map((imp)=>{
     return {id:imp._id, total:imp.orderTotal, date:imp.updatedAt}
    })
 
    if(!filterOrders) return res.status(400).json({message: "Something Went Wrong"});
 
    res.status(201).send(filterOrders)
})


router.get('/delivery', (req, res)=>{
    OrderCollection.find({'status.en':"On Delivery"}).sort({_id:-1}).exec((err, data)=>{
        if(err){
            res.status(500).send(err);
        }else{
            res.status(201).send(data);
        }
    })
})

router.post('/user', (req, res)=>{
    const {_id} = req.body;
    OrderCollection.find({customerID:_id}).sort({createdAt:-1}).exec((err, data)=>{
        if(err){
            res.status(500).send(err);
        }else{
            res.status(201).send(data);
        }
    })
})

router.post('/checked', (req, res)=>{
    const {_id} = req.body;

    OrderCollection.findByIdAndUpdate(_id, {checked:true}, ({new:true}), (err, data)=>{
        if(err){
            res.status(500).json({
                error:err
            });
        }else{
            req.io.emit("update_order", {data:data});
        }
    })
})

router.post('/start_delivery', (req, res)=>{
    const {_id, customerID, empName} = req.body;

    OrderCollection.findByIdAndUpdate(_id, {employeeName:empName, status:{en:"On Delivery", la:"ກໍາລັງຈັດສົ່ງ"}}, ({new:true}), (err, data)=>{
        if(err){
            res.status(500).json({
                error:err
            });
        }else{
            req.io.emit("order_start_end", {data:data, message:`Start Delivery ID ${_id} by ${empName}`});
            const clientSocket = onlineUsers.get(customerID);
            req.io.to(clientSocket).emit("order_update", {data:data})
        }
    })
})

router.post('/complete_order', (req, res)=>{
    const {_id, customerID} = req.body;

    OrderCollection.findByIdAndUpdate(_id, {status:{en:"Completed", la:"ສໍາເລັດການສັ່ງ"}}, ({new:true}), (err, data)=>{
        if(err){
            res.status(500).json({
                error:err
            });
        }else{
            req.io.emit("order_start_end", {data:data, message:`Order ID ${_id} completed`});
            const clientSocket = onlineUsers.get(customerID);
            req.io.to(clientSocket).emit("order_update", {data:data})
        }
    })
})

router.post('/cancelled', async(req, res)=>{
    const {order} = req.body;

    await order.orderItems.map((item)=>{
        try {
            ItemCollection.findByIdAndUpdate({_id:item._id}, {$inc:{quantity: item.quantity}}, (err, data)=>{
                if(err){
                    res.status(400).send(error.message)
                }
            })
        } catch (error) {
            res.status(400).send(error.message);
        }
    })

    OrderCollection.findByIdAndUpdate({_id:order._id}, {status:{en:"Cancelled", la:"ການສັ່ງຍົກເລີກ"}}, ({new:true}), (err, data)=>{
        if(err){
            res.status(500).json({
                error:err
            });
        }else{
            req.io.emit("order_start_end", {data:data, message:`Order Cancelled`});
            const clientSocket = onlineUsers.get(order.customerID);
            req.io.to(clientSocket).emit("order_update", {data:data})
        }
    })
})

router.post('/', async(req, res)=>{
    const {userID, name, address, phone, method, total, cart} = req.body;

    await cart.map((item)=>{
        try {
            ItemCollection.findByIdAndUpdate({_id:item._id}, {$inc:{quantity: -item.quantity}}, (err, data)=>{
                if(err){
                    res.status(400).send(error.message)
                }
            })
        } catch (error) {
            res.status(400).send(error.message);
        }
    })

    new OrderCollection({
        customerID:userID,
        customerName:name,
        customerPhone:Number(phone),
        customerAddress:{
            addr:address.addr,
            coords:{
                lat:address.coords.lat,
                lng:address.coords.lng
            }
        },
        orderItems:cart,
        orderTotal:Number(total),
        paymentMethod:method,
        status:{en:"Pending", la:"ລໍຖ້າຢູ່"}
    }).save()
    .then(result=>{
        res.status(201).json({
            message:"New Order registered successfully"
        })
        
        req.io.emit("new-order",{data:result});
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        });
    });
})

export default router;