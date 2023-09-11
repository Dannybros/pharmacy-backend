import express from 'express';
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

router.post('/clientKey', async(req, res)=>{
    const {price} = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: price,
      currency: 'lak',
      automatic_payment_methods: {enabled: true},
    });
    
    res.status(201).json(paymentIntent)
})

router.post('/cancel', async(req, res)=>{
    const {id} = req.body;
    await stripe.paymentIntents.cancel(id);

    res.json('Cancelled the payment')
})

export default router