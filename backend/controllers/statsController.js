import EventModel from "../models/event.model.js";

export const getStats = async (req,res)=>{

    try {
        const {site_id, date} = req.query //date format= year-month-date e.g. date=2025-12-23
        if(!site_id){
            return res.status(400).json({success:false, message:"site_id is required in query"})
        }

        //for matching documents/data in mongodb aggregation pipeline
        let matchStage = {site_id}

        //date matching is optional
        if(date){
            matchStage.timestamp = {
                $gte: new Date(`${date}T00:00:00.000Z`),
                $lte: new Date(`${date}T23:59:59.999Z`)
            };
        }

        const result = await EventModel.aggregate([
            { $match:matchStage},
            {
                $group:{
                    _id:"$path",
                    views:{$sum:1},
                    users:{$addToSet: "$userid"}
                }
            },
            {
                $project:{
                    _id:0,
                    path:"$_id",
                    views:1,
                    users:1,
                    unique_users:{$size: "$users"}
                }
            },
            {$sort:{views:-1}}
        ])

        //calculate total site views, by adding path views of all paths
        const total_views= result.reduce((a,b)=>a+b.views, 0)

        //calculate site's total unique users, by getting unique users from all paths, and getting size of allUsers set
        const allUsers = new Set(result.flatMap(r => r.users));
        const unique_users = allUsers.size;

        const top_paths= result.map(r=> { 
            return {
                "path":r.path,
                "views":r.views,
                "unique_users":r.unique_users,
            }
        })

        return res.status(200).json({success:true, 
            stats:{
                site_id,
                date: date || "all",
                total_views,
                unique_users,
                top_paths: top_paths.slice(0,5)
            }
        })


    } catch (error) {
        console.log("Error getting stats: ", error)
    }
}