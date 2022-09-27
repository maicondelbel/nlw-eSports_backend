import { z } from 'zod'

export const paramsSchemaValidate = z.object({
  id: z.string().uuid(),
})
