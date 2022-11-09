import cors from 'cors'
import express, { Router } from 'express'

import adRouter from './routes/ad'
import gameRouter from './routes/game'

const app = express()
const routes = Router()

app.use(express.json())

app.use(cors())

routes.use('/games', gameRouter)
routes.use('/ads', adRouter)

app.use(routes)

app.listen(process.env.PORT || 3333, () => console.log('Server running...'))
