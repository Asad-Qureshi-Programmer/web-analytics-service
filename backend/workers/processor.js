import connectDB from "../config/db.js";
import redis from "../config/redis.js";
import EventModel from "../models/event.model.js";

const Processor = async ()=>{
let counter=0
while(true){
    try {
        counter++
        const label = `mongo write time ${counter}`
        console.log("Worker running!...")

            const data = await redis.brpop("events_queue", 0) //blocking pop
            const event = JSON.parse(data[1])

            console.time(label);
            const eventMongo= await EventModel.create(event)
            console.timeEnd(label);

            console.log("Data from mongodb: ", eventMongo)

    } catch (error) {
        console.log("Error in worker: ",error)
    }
}

}

connectDB()
Processor()
