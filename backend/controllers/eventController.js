import EventModel from '../models/event.model.js'
import redis from "../config/redis.js";
/*
"site_id": "site-abc-123", 
"event_type": "page_view",
"path": "/pricing", 
"userid": "user-xyz-789",
"timestamp":"2025-11-12T19:30:01Z"
*/

export const ingestEvent = async (req,res)=>{
    try {
        console.time("Redis push time")
        const {site_id, event_type, path, userid, timestamp} = req.body
        
        if(!site_id || !event_type || !path || !userid) {
            return res.status(400).json({success:false, message:"Missing fields!"})
        }

        //push these things in Redis queue/list
        /*******Compare time (4-8ms,avg=6ms)= UNCOMMENT below line, comment below 2 mongodb lines 25-26 */
        await redis.lpush("events_queue", JSON.stringify(req.body))

        /*******Compare time (40ms-120ms, avg=65ms) = UNCOMMENT below two lines and COMMENT above line, to start writing event to Mongodb*/
        // const eventMongo= await EventModel.create(req.body)
        // console.log("Event from db: ",eventMongo)

        console.timeEnd("Redis push time")
        return res.status(200).json({success:true, message:"Event Queued"})
    } catch (error) {
        console.log(`Error in getting event details: ${error.message}`)
        res.status(500).json({success:false, message:"Internal server error while queing event"})
    }
}
