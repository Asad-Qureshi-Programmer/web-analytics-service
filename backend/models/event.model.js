import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    site_id:{
        type:String,
        required:true
    },
    event_type:{
        type:String,
        required:true,
        lowercase:true
    },
    path:{
        type:String,
        lowercase:true
    },
    userid:{
        type:String,
        lowercase:true
    },
    timestamp:{
        type:Date
    }
})

const eventModel = mongoose.model('Event', eventSchema)

export default eventModel