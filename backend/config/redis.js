import Redis from 'ioredis'
import dotenv from 'dotenv'
dotenv.config()
const redis = new Redis("127.0.0.1:6379") //default localhost:6379

export default redis
