import HTTPSTATUS from '~/constants/httpStatus'
import USER_MESSAGES from '~/constants/messages'

type EntityErrorType = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
>

export class ErrorWithStatus {
  //class ErrorWithStatus extends Error bị dính express_vatidetion bị mất status
  message: string
  status: number
  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}
export class EntityError extends ErrorWithStatus {
  //class ErrorWithStatus extends Error bị dính express_vatidetion bị mất status
  error: EntityErrorType
  constructor({ message = USER_MESSAGES.VALIDATION_ERROR, error }: { message?: string; error: EntityErrorType }) {
    super({ message, status: HTTPSTATUS.UNPROCESABLE_ENTITY })
    this.error = error
  }
}
