import { checkSchema } from 'express-validator'
import { MediaTypeReq } from '~/models/Other'
import { validate } from '~/utils/validation'

export const searchTweetsValidtor = validate(
  checkSchema({
    content: {
      isString: {
        errorMessage: 'Content is not string '
      }
    },
    media_type: {
      optional: true,
      isIn: {
        options: [Object.values(MediaTypeReq)]
      },
      errorMessage: `Media_type must be one of ${Object.values(MediaTypeReq)} `
    }
  })
)
