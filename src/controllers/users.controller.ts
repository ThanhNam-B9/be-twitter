import { Request, Response } from 'express'
import usersService from '~/services/user.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  ChangePasswordReqBody,
  FollowerReqBody,
  ForgotReqBody,
  GetProfileReqParams,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload,
  UnfollowerReqParams,
  UpdateMeReqBody,
  VerifyEmailReqBody,
  VerifyForgotReqBody
} from '~/models/request/User.request'
import User from '~/models/schemas/Users.schema'
import { ObjectId } from 'mongodb'
import dbConnect from '~/services/database.services'
import HTTPSTATUS from '~/constants/httpStatus'
import USERS_MESSAGES from '~/constants/messages'
import { UserVerifyStatus } from '~/constants/enum'
import { envConfig } from '~/constants/config'
export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const verify = user.verify
  const result = await usersService.login({ user_id, verify })
  return res.json({
    message: 'Login success !',
    result
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  return res.json({
    message: 'Register success !',
    result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await usersService.logout(refresh_token)
  return res.json(result)
}
export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response
) => {
  const { user_id, verify } = req.decoded_refresh_token as TokenPayload
  const { refresh_token } = req.body
  const result = await usersService.resfreshToken({ user_id, verify, refresh_token })
  return res.json({
    message: USERS_MESSAGES.REFRESHTOKEN_SUCCESS,
    result
  })
}
export const verifyEmailController = async (req: Request<ParamsDictionary, any, VerifyEmailReqBody>, res: Response) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await dbConnect.user.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    return res.status(HTTPSTATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  if (user.email_verify_token === '') {
    return res.json({
      message: USERS_MESSAGES.EMAIL_READLY_VERIFIED_BEFORE
    })
  }
  const result = await usersService.verifyEmail(user_id)
  return res.json({
    message: USERS_MESSAGES.EMAIL_IS_VERIFIED,
    result
  })
}
export const rendVerifyEmaillController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await dbConnect.user.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    return res.status(HTTPSTATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  if (user.verify === UserVerifyStatus.Unverified) {
    return res.json({
      message: USERS_MESSAGES.EMAIL_READLY_VERIFIED_BEFORE
    })
  }
  const result = await usersService.resendVerifyEmail(user_id)
  return res.json(result)
}
export const forgotPasswordController = async (req: Request<ParamsDictionary, any, ForgotReqBody>, res: Response) => {
  const { _id, verify } = req.user as User
  // const user_id = user._id as ObjectId
  // const verify = user.verify
  // console.log('id', user)
  const result = await usersService.forgotPasssword({ user_id: _id as ObjectId, verify })
  return res.json(result)
}
export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, VerifyForgotReqBody>,
  res: Response
) => {
  // const { user_id } = req.decoded_forgot_password_token as TokenPayload
  // const user = await dbConnect.user.findOne({ _id: new ObjectId(user_id) })
  // if (!user) {
  //   return res.status(HTTPSTATUS.NOT_FOUND).json({
  //     message: USERS_MESSAGES.USER_NOT_FOUND
  //   })
  // }
  // if (user.forgot_password_token !== req.body.forgot_password_token) {
  //   return res.status(HTTPSTATUS.UNAUTHORIZED).json({
  //     message: USERS_MESSAGES.INVALID_VERIFY_FORGOT_PASSWORD_TOKEN
  //   })
  // }
  return res.json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const payload = { password: req.body.password, user_id }
  const result = await usersService.resetPassword(payload)
  return res.json(result)
}

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await usersService.getMe(user_id)
  return res.json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    result
  })
}

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeReqBody>, res: Response) => {
  const data = req.body
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await usersService.updateMe({ user_id, data })
  return res.json({
    message: USERS_MESSAGES.UPDATED_USER_SUCCESS,
    result
  })
}
export const getProfileMeController = async (req: Request<GetProfileReqParams>, res: Response) => {
  const { username } = req.params
  const result = await usersService.getProfileMe(username)
  return res.json({
    message: USERS_MESSAGES.GET_PROFILE_SUCCESS,
    result
  })
}

export const followerController = async (req: Request<ParamsDictionary, any, FollowerReqBody>, res: Response) => {
  const { followed_user_id } = req.body
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await usersService.follower(followed_user_id, user_id)
  return res.json(result)
}

export const unfollowerController = async (req: Request<UnfollowerReqParams>, res: Response) => {
  const { user_id: followed_user_id } = req.params
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await usersService.unfollower(followed_user_id, user_id)
  return res.json(result)
}
export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response
) => {
  const { password } = req.body
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await usersService.changePassword(user_id, password)
  return res.json(result)
}

export const oauthController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { code } = req.query
  const result = await usersService.oauthLogin(code as string)
  const urlRedirect = `${envConfig.clientRedirectCallback}?access_token=${result.access_token}&refresh_token=${result.refresh_token}&new_user=${result.newUser}&verify=${result.verify}`
  return res.redirect(urlRedirect)
}
