import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import { userIdShema } from './users.middleware'

export const conversationsValidator = validate(
  checkSchema(
    {
      receiver_id: userIdShema
    },
    ['params']
  )
)
