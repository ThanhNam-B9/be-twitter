import HTTPSTATUS from '~/constants/httpStatus'
import USERS_MESSAGES from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { verifyToken } from './jwt'
import { Request } from 'express'
import { capitalize } from 'lodash'
import { JsonWebTokenError } from 'jsonwebtoken'
import { envConfig } from '~/constants/config'

export const coverNumberToEnumType = (TweetType: any) => {
  return Object.values(TweetType).filter((item) => typeof item === 'number')
}
export const verifyAccessToken = async (access_token: string, req?: Request) => {
  if (!access_token) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.ACCESSTOKEN_IS_REQUIRED,
      status: HTTPSTATUS.UNAUTHORIZED
    })
  }
  try {
    const decoded_authorization = await verifyToken({
      token: access_token,
      secretOnpulichKey: envConfig.jwtSecretAccessToken as string
    })
    if (req) {
      ;(req as Request).decoded_authorization = decoded_authorization
      return true
    }
    return decoded_authorization
  } catch (error) {
    throw new ErrorWithStatus({
      message: capitalize((error as JsonWebTokenError).message),
      status: HTTPSTATUS.UNAUTHORIZED
    })
  }
}
