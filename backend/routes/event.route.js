import express from 'express'
import {ingestEvent} from '../controllers/eventController.js'
const router = express.Router()

router.post('/', ingestEvent)

export default router