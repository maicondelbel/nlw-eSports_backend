import { PrismaClient } from '@prisma/client'
import cors from 'cors'
import express, { Request, Response } from 'express'

import { bodySchemaValidate } from './utils/bodySchemaValidate'
import { convertHoursStringToMinutes } from './utils/convertHoursStringToMinutes'
import { convertMinutesToHourString } from './utils/convertMinutesToHourString'
import { paramsSchemaValidate } from './utils/paramsSchemaValidate'

const app = express()
app.use(express.json())
app.use(cors())

const prisma = new PrismaClient({
  log: ['info', 'query', 'warn'],
})

app.get('/games', async (request: Request, response: Response) => {
  try {
    const games = await prisma.game.findMany({
      include: {
        _count: {
          select: {
            ads: true,
          },
        },
      },
    })

    return response.json(games)
  } catch (err) {
    return response
      .status(400)
      .json({ error: true, msg: 'Falha ao retornar a lista de Games!' })
  }
})

app.post('/games/:id/ads', async (request: Request, response: Response) => {
  const validateBody = bodySchemaValidate.safeParse(request.body)
  const validateParams = paramsSchemaValidate.safeParse(request.params)

  if (!validateBody.success && !validateParams.success) {
    return response.status(400).json({
      error: true,
      msg: 'Corpo e Parâmetro(s) da requisição inválidos',
    })
  }

  if (!validateBody.success) {
    return response
      .status(400)
      .json({ error: true, msg: 'Corpo da requisição inválidos' })
  }

  if (!validateParams.success) {
    return response
      .status(400)
      .json({ error: true, msg: 'Parâmetro(s) da requisição inválido(s)' })
  }

  const gameId = request.params.id
  const {
    name,
    yearsPlaying,
    discord,
    weekDays,
    hourStart,
    hourEnd,
    useVoiceChannel,
  } = request.body

  try {
    const ad = await prisma.ad.create({
      data: {
        gameId,
        name,
        yearsPlaying,
        discord,
        weekDays: weekDays.join(','),
        hourStart: convertHoursStringToMinutes(hourStart),
        hourEnd: convertHoursStringToMinutes(hourEnd),
        useVoiceChannel,
      },
    })

    return response.status(201).json(ad)
  } catch (err) {
    return response.status(400).json({
      error: true,
      msg: 'Falha ao inserir um Anúncio para o Game especificado!',
    })
  }
})

app.get('/games/:id/ads', async (request: Request, response: Response) => {
  const validateParams = paramsSchemaValidate.safeParse(request.params)

  if (!validateParams.success) {
    return response
      .status(400)
      .json({ error: true, msg: 'Parâmetro(s) da requisição inválido(s)' })
  }

  const gameId = request.params.id

  try {
    const ads = await prisma.ad.findMany({
      select: {
        id: true,
        name: true,
        weekDays: true,
        useVoiceChannel: true,
        yearsPlaying: true,
        hourStart: true,
        hourEnd: true,
      },
      where: {
        gameId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return response.json(
      ads.map((ad) => {
        return {
          ...ad,
          weekDays: ad.weekDays.split(','),
          hourStart: convertMinutesToHourString(ad.hourStart),
          hourEnd: convertMinutesToHourString(ad.hourEnd),
        }
      }),
    )
  } catch (err) {
    return response.status(400).json({
      error: true,
      msg: 'Falha ao retornar o(s) Anúncio(s) do Game informado! ',
    })
  }
})

app.get('/ads/:id/discord', async (request: Request, response: Response) => {
  const validateParams = paramsSchemaValidate.safeParse(request.params)

  if (!validateParams.success) {
    return response
      .status(400)
      .json({ error: true, msg: 'Parâmetro(s) da requisição inválido(s)' })
  }

  try {
    const adId = request.params.id
    const ad = await prisma.ad.findUniqueOrThrow({
      select: {
        discord: true,
      },
      where: {
        id: adId,
      },
    })

    return response.json({ discord: ad.discord })
  } catch (err) {
    return response
      .status(400)
      .json({ error: 'Falha ao retornar o Discord do Anúncio informado' })
  }
})

app.listen(process.env.APP_PORT || 3333, () => console.log('Server running...'))
