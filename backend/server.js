import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import eventRoute from './routes/event.route.js'
import statsRoute from './routes/stats.route.js'
const app = express()
dotenv.config()
connectDB()

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use('/event', eventRoute)
app.use('/stats', statsRoute)

app.get('/',(req,res)=>{
    res.send("Hello I am asad")
})

const PORT = 3000
app.listen(PORT, ()=> console.log(`Server is running on port:${PORT} `))