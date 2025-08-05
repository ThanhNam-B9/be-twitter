import express from 'express'
import { validationResult, ContextRunner, ValidationChain, Result } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import HTTPSTATUS from '~/constants/httpStatus'
import { EntityError, ErrorWithStatus } from '~/models/Errors'
// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await validation.run(req)

    const errors = validationResult(req)
    // Không có lỗi thì next
    if (errors.isEmpty()) {
      return next()
    }
    const errorsObject = errors.mapped()
    const entityError = new EntityError({ error: {} })
    for (const key in errorsObject) {
      const { msg } = errorsObject[key]
      //lỗi cho toast
      if (msg instanceof ErrorWithStatus && msg.status !== HTTPSTATUS.UNPROCESABLE_ENTITY) {
        return next(msg)
      }
      // 422 lỗi dùng cho form UI
      entityError.error[key] = errorsObject[key]
    }
    next(entityError)
  }
}
