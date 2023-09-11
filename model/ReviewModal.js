
import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
    reviewTo:String,
    reviews:{ type : Array , "default" : [] },
})

const ReviewCollection = mongoose.model('reviews', reviewSchema);

export default ReviewCollection;