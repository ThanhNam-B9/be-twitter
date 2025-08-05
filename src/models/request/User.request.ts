import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { ParamsDictionary } from 'express-serve-static-core'
/**
 * @swagger
 * components:
 *   schemas:
 *     LoginBody:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           example: 'userchat01@gmail.com'
 *         password:
 *           type: string
 *           example: 'Nam813802@@'
 *     SuccessAuthentication:
 *       type: object
 *       properties:
 *         access_token:
 *           type: string
 *           example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjY3M2QzYjc5NzBmZTU0MWI1ZDg5NWRhIiwidmVyaWZ5IjoxLCJ0b2tlbl90eXBlIjowLCJpYXQiOjE3MTkzMDgyMDAsImV4cCI6MTcxOTMxMTgwMH0.t9YeCS8FLdGKxGn0Fr9LCjDwB6MRrRwqJyEetX9bry8'
 *           description: Access token
 *         refresh_token:
 *           type: string
 *           example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjY3M2QzYjc5NzBmZTU0MWI1ZDg5NWRhIiwidmVyaWZ5IjoxLCJ0b2tlbl90eXBlIjoxLCJpYXQiOjE3MTkzMDgyMDAsImV4cCI6MTcxOTM5NDYwMH0.MTUal-wU2oeGSkCxaErUKV7fGI_wMrJb3qNu2KW8k5s'
 *           description: Refresh Token
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: '6673d3b7970fe541b5d895da'
 *         name:
 *           type: string
 *           example: 'Nam'
 *         email:
 *           type: string
 *           example: 'userchat01@gmail.com'
 *         date_of_birth:
 *           type: string
 *           format: date-time
 *           example: '2024-04-09T02:19:01.736Z'
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: '2024-06-20T07:01:11.103Z'
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: '2024-06-20T07:01:11.103Z'
 *         verify:
 *           $ref: '#/components/schemas/UserVerifyStatus'
 *         bio:
 *           type: string
 *           example: 'dsdasssd'
 *         twitter_circle:
 *           type: array
 *           items:
 *             type: string
 *           example: ['6673d3b7970fe541b5d895dg', '6673d3b7970fe541b5d895dc']
 *         location:
 *           type: string
 *           example: 'Thủ Đức'
 *         website:
 *           type: string
 *           example: 'abc.com'
 *         username:
 *           type: string
 *           example: 'user6673d3b7970fe541b5d895da'
 *         avatar:
 *           type: string
 *           example: 'https://www.facebook.com/photo/?fbid=1969125303271173&set=a.107106286139760'
 *         cover_photo:
 *           type: string
 *           example: 'https://www.facebook.com/photo/?fbid=1969125303271173&set=a.107106286139760'
 *     UserVerifyStatus:
 *       type: number
 *       enum: [Unverified, Verified, Banned]
 *       example: 1
 */
export interface RegisterReqBody {
  name: string
  email: string
  date_of_birth: string
  password: string
  comfirm_password: string
}
export interface LogoutReqBody {
  refresh_token: string
}
export interface RefreshTokenReqBody {
  refresh_token: string
}
export interface ForgotReqBody {
  email: string
}
export interface VerifyForgotReqBody {
  forgot_password_token: string
}
export interface VerifyEmailReqBody {
  email_verify_token: string
}
export interface ResetPasswordReqBody {
  forgot_password_token: string
  password: string
  comfirm_password: string
}
export interface UpdateMeReqBody {
  name?: string
  date_of_birth?: string
  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}
export interface FollowerReqBody {
  followed_user_id: string
}
export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
  verify: UserVerifyStatus
  exp: number
  iat: number
}

export interface UnfollowerReqParams extends ParamsDictionary {
  user_id: string
}
export interface GetProfileReqParams {
  username: string
}
export interface ChangePasswordReqBody {
  old_password: string
  password: string
  confirm_password: string
}
