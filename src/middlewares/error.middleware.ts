import { NextFunction, Request, Response } from 'express'
import { omit } from 'lodash'
import HTTPSTATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'

const defaultErrorHandle = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ErrorWithStatus) {
    return res.status(err.status || HTTPSTATUS.INTERNAL_SERVER_ERROR).json(omit(err, ['status']))
  }
  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true })
  })

  res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    errorInfor: omit(err, ['stack'])
  })
}

export default defaultErrorHandle
