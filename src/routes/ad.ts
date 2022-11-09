import express, { Request, Response } from 'express'

import { prisma } from '../lib/prisma'
import { paramsSchemaValidate } from '../utils/paramsSchemaValidate'

const adRouter = express.Router()

adRouter.get('/:id/discord', async (request: Request, response: Response) => {
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

export default adRouter
