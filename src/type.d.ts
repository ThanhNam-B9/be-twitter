import Request from 'express'
import User from './models/schemas/Users.schema'
import { TokenPayload } from './models/request/User.request'
import Tweet from './models/schemas/Tweet.schema'

declare module 'express' {
  interface Request {
    user?: User
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
    decoded_email_verify_token?: TokenPayload
    decoded_forgot_password_token?: TokenPayload
    // decoded_rest_password_token?: TokenPayload
    tweet?: Tweet
  }
}
