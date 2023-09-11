import express from 'express'
import ReviewCollection from '../model/ReviewModal.js';

const router = express.Router();

router.post("/get/all-review", async(req, res)=>{
    const {reviewTo} = req.body;

    const existingReview = await ReviewCollection.findOne({reviewTo:reviewTo})

    if(!existingReview) return res.status(400).json({message: "There is no review on this yet"});

    res.status(200).json({data:existingReview.reviews})
})

router.post('/get/one', async(req, res)=>{

    const {reviewTo, userId} = req.body;

    const existingReview = await ReviewCollection.findOne({reviewTo:reviewTo})

    if(!existingReview) return res.status(400).json({message: "There is no review on this yet"});

    const existingUserReview = existingReview.reviews.find(x => x._id === userId);

    if(!existingUserReview)  return res.status(400).json({message: "There is no review"});
    
    res.status(201).json({message:"successfully retrieved a review", data:existingUserReview});
})

router.get('/shop/top3', async(req, res)=>{
    const reviewCollection = await ReviewCollection.findOne({reviewTo:"shop"})

    if(!reviewCollection) return res.status(404).json({message:"NO Reviews Yet"})

    const top_reviews = reviewCollection.reviews.sort((a,b)=>b.value-a.value).slice(0,3);

    res.status(200).json({data:top_reviews})
})

router.post('/overall-rating', async(req, res)=>{
    const {reviewTo} = req.body;

    const reviewCollection = await ReviewCollection.findOne({reviewTo:reviewTo})

    if(!reviewCollection) return res.status(404).json({message:"NO Reviews Yet"})

    const allReview = reviewCollection.reviews;

    const ratingAverage = Math.round(allReview.reduce((total, next) => total + next.value, 0) / allReview.length *10)/10

    res.status(200).json({rating:ratingAverage})

})

router.post('/get/top5', async(req, res)=>{
    const{reviewTo} = req.body;

    const reviewCollection = await ReviewCollection.findOne({reviewTo:reviewTo})

    if(!reviewCollection) return res.status(404).json({message:"NO Reviews Yet"})

    const top_5_reviews = reviewCollection.reviews.sort((a,b)=>b.value-a.value).slice(0,5);

    res.status(200).json({data:top_5_reviews})
})

router.post('/insert', async(req, res)=>{

    const {reviewTo, review} = req.body;

    const existingReviewCollection = await ReviewCollection.findOne({reviewTo:reviewTo})
    
    if(existingReviewCollection){
        ReviewCollection.findOneAndUpdate({reviewTo:reviewTo}, {$push:{reviews:review}}, (err, data)=>{
            if(err) return res.status(500).json({error:err});
            res.status(201).json({message:"New Review Has been Uploaded"})
        })
    }else{
        new ReviewCollection({reviewTo:reviewTo, reviews:[review]}).save()
        .then(result=>{
            res.status(201).json({
                message:"New Review Has been Uploaded",
            })
        })
        .catch(err=>{
            res.status(500).json({
                message:"Something went wrong, please try again."
            });
        });
    }

})

router.post('/update', async(req, res)=>{

    const {reviewTo, review} = req.body;

    ReviewCollection.updateOne(
        { reviewTo: reviewTo, "reviews._id": review._id },
        {
            $set: {
                "reviews.$.name": review.name,
                "reviews.$.value": review.value,
                "reviews.$.des": review.des,
             }
        }, (err, data)=>{
            if(err) return res.status(400).json({message:"Sth went wrong"})
            return res.status(200).json({message:"Successfully updated review"})
        }
    )
    
})


export default router;