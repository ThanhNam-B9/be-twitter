import User from '~/models/schemas/Users.schema'
import dbConnect from './database.services'
import { RegisterReqBody, ResetPasswordReqBody, UpdateMeReqBody } from '~/models/request/User.request'
import { hashPassword } from '~/utils/crypto '
import { signToken, verifyToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import RefreshToken from '~/models/schemas/RefreshToken.shema'
import { config } from 'dotenv'
import { ObjectId } from 'mongodb'
import USERS_MESSAGES from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import HTTPSTATUS from '~/constants/httpStatus'
import Follower from '~/models/schemas/Followers.shema'
import axios from 'axios'
import { envConfig } from '~/constants/config'
// tại sao lại dung class
class UsersService {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        verify,
        token_type: TokenType.AccessToken
      },
      privateKey: envConfig.jwtSecretAccessToken as string,
      options: {
        expiresIn: envConfig.expiredAccessToken
      }
    })
  }
  private signRefreshToken({ user_id, verify, exp }: { user_id: string; verify: UserVerifyStatus; exp?: number }) {
    if (exp) {
      return signToken({
        payload: {
          user_id,
          verify,
          token_type: TokenType.RefreshToken,
          exp
        },
        privateKey: envConfig.jwSecretRefreshToken as string
      })
    }
    return signToken({
      payload: {
        user_id,
        verify,
        token_type: TokenType.RefreshToken
      },
      privateKey: envConfig.jwSecretRefreshToken as string,
      options: {
        expiresIn: envConfig.expiredRefreshToken
      }
    })
  }
  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        verify,
        token_type: TokenType.EmailVerifyToken
      },
      privateKey: envConfig.expiredVerifyEmailToken as string,

      options: {
        expiresIn: envConfig.expiredVerifyEmailToken
      }
    })
  }
  private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        verify,
        token_type: TokenType.ForgotPasswordToken
      },
      privateKey: envConfig.jwtSecretForgotPasswordToken as string,

      options: {
        expiresIn: envConfig.expiredForgotPasswordToken
      }
    })
  }
  private async signAccessTokenAndRefreshToken({
    user_id,
    verify,
    exp
  }: {
    user_id: string
    verify: UserVerifyStatus
    exp?: number
  }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify, exp })])
  }
  register = async (payload: RegisterReqBody) => {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })

    const result = await dbConnect.user.insertOne(
      new User({
        ...payload,
        _id: user_id,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password),
        email_verify_token,
        username: `user${user_id.toString()}`
      })
    )
    const userId = result.insertedId.toString()
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({
      user_id: userId,
      verify: UserVerifyStatus.Unverified
    })
    const { exp, iat } = await this.decodedRefreshToken(refresh_token)
    await dbConnect.RefreshToken.insertOne(
      new RefreshToken({ user_id: new ObjectId(userId), token: refresh_token, exp, iat })
    )
    return {
      access_token,
      refresh_token
    }
  }
  isCheckEmailExits = async (email: string) => {
    const user = await dbConnect.user.findOne({ email })

    return Boolean(user)
  }
  login = async ({ user_id, verify }: { user_id: ObjectId; verify: UserVerifyStatus }) => {
    const userId = user_id.toString()
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({
      user_id: userId,
      verify
    })
    const { exp, iat } = await this.decodedRefreshToken(refresh_token)
    await dbConnect.RefreshToken.insertOne(
      new RefreshToken({ user_id: new ObjectId(userId), token: refresh_token, exp, iat })
    )
    const user = await dbConnect.user.findOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )

    return {
      access_token,
      refresh_token,
      user
    }
  }
  async decodedRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      secretOnpulichKey: envConfig.jwSecretRefreshToken as string
    })
  }
  async resfreshToken({
    user_id,
    verify,
    refresh_token
  }: {
    user_id: string
    verify: UserVerifyStatus
    refresh_token: string
  }) {
    const { exp, iat } = await this.decodedRefreshToken(refresh_token)
    const [new_access_token, new_refresh_token] = await this.signAccessTokenAndRefreshToken({ user_id, verify, exp })

    await Promise.all([
      dbConnect.RefreshToken.insertOne(
        new RefreshToken({
          token: new_refresh_token,
          user_id: new ObjectId(user_id),
          exp: exp,
          iat: iat
        })
      ),
      dbConnect.RefreshToken.deleteOne({ token: refresh_token })
    ])
    return {
      access_token: new_access_token,
      refresh_token: new_refresh_token
    }
  }
  private async getOauthGoogleToken(code: string) {
    const body = {
      code,
      client_id: envConfig.googleClientId,
      client_secret: envConfig.googleClientSecret,
      redirect_uri: envConfig.googleRedirectUri,
      grant_type: 'authorization_code'
    }
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    console.log('data', data)

    return data as {
      access_token: string
      id_token: string
    }
  }
  /// có thể dùng access_token trong data được google trả về hoặc gọi thêm Api cho google trả lại lần nữa
  private async getGoogleUserInfor(access_token: string, id_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })

    return data as {
      id: string
      email: string
      verified_email: boolean
      name: string
      given_name: string
      family_name: string
      picture: string
      locale: string
    }
  }
  async oauthLogin(code: string) {
    const { access_token, id_token } = await this.getOauthGoogleToken(code)
    const userInfo = await this.getGoogleUserInfor(access_token, id_token)
    if (!userInfo.verified_email) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.GMAIL_NOT_VERIFIED,
        status: HTTPSTATUS.BAD_REQUEST
      })
    }
    const user = await dbConnect.user.findOne({ email: userInfo.email })
    if (user) {
      const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({
        user_id: user._id.toString(),
        verify: user.verify
      })
      const { exp, iat } = await this.decodedRefreshToken(refresh_token)
      await dbConnect.RefreshToken.insertOne(new RefreshToken({ user_id: user._id, token: refresh_token, exp, iat }))
      return {
        access_token,
        refresh_token,
        newUser: 0,
        verify: user.verify
      }
    } else {
      const passwwordDefault = Math.random().toString(36).substring(2, 15)

      const data = await this.register({
        email: userInfo.email,
        name: userInfo.name,
        date_of_birth: new Date().toISOString(),
        password: passwwordDefault,
        comfirm_password: passwwordDefault
      })
      return {
        ...data,
        newUser: 1,
        verify: UserVerifyStatus.Unverified
      }
    }
  }
  async logout(refresh_token: string) {
    await dbConnect.RefreshToken.deleteOne({ token: refresh_token })
    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS
    }
  }
  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.signAccessTokenAndRefreshToken({ user_id, verify: UserVerifyStatus.Verified }),
      dbConnect.user.updateOne(
        {
          _id: new ObjectId(user_id)
        },
        {
          $set: {
            email_verify_token: '',
            verify: UserVerifyStatus.Verified
            // updated_at: new Date() thời gian mình tự tạo sẽ bị trễ nhịp khi cập nhật lên MONGO
          },
          $currentDate: {
            updated_at: true // của MONGO Cập tời gian khi mongo cập nhật
          }
        }
      )
    ])
    const [access_token, refresh_token] = token
    const { exp, iat } = await this.decodedRefreshToken(refresh_token)
    await dbConnect.RefreshToken.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, exp, iat })
    )

    return {
      access_token,
      refresh_token
    }
  }
  async resendVerifyEmail(user_id: string) {
    //Giả bộ gửi emaill
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    // cập nhật lại giá trị email_verify_token
    await dbConnect.user.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          email_verify_token
          // updated_at: new Date() thời gian mình tự tạo sẽ bị trễ nhịp khi cập nhật lên MONGO
        },
        $currentDate: {
          updated_at: true // của MONGO Cập tời gian khi mongo cập nhật
        }
      }
    )
    return {
      message: USERS_MESSAGES.SENDED_VERIFY_EMAIL_SUCCESS
    }
  }
  async forgotPasssword({ user_id, verify }: { user_id: ObjectId; verify: UserVerifyStatus }) {
    const forgot_password_token = await this.signForgotPasswordToken({ user_id: user_id.toString(), verify })
    /// giả bộ send email
    await dbConnect.user.updateOne(
      {
        _id: user_id
      },
      {
        $set: {
          forgot_password_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    // GỬi email kèm dường link đến email người dùng : https://twitter.com/forgot-password?token=token
    // kiểm tra đường link xem còn hợp lệ hay không
    console.log('forgot_password_token', forgot_password_token)
    return {
      message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  }
  async resetPassword(payload: { password: string; user_id: string }) {
    await dbConnect.user.updateOne(
      {
        _id: new ObjectId(payload.user_id)
      },
      {
        $set: {
          password: hashPassword(payload.password),
          forgot_password_token: ''
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }
  async getMe(user_id: string) {
    const user = await dbConnect.user.findOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }
  async updateMe({ user_id, data }: { user_id: string; data: UpdateMeReqBody }) {
    const _data = data.date_of_birth ? { ...data, date_of_birth: new Date(data.date_of_birth) } : data

    const result = await dbConnect.user.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          ...(_data as UpdateMeReqBody & { date_of_birth?: Date })
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        },
        returnDocument: 'after'
      }
    )
    return result
  }
  async getProfileMe(username: string) {
    const profile = await dbConnect.user.findOne(
      {
        username
      },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0,
          updated_at: 0,
          created_at: 0
        }
      }
    )
    if (profile === null) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTPSTATUS.NOT_FOUND
      })
    }

    return profile
  }
  async follower(followed_user_id: string, user_id: string) {
    const follower_user = await dbConnect.Followers.findOne({
      followed_user_id: new ObjectId(followed_user_id),
      user_id: new ObjectId(user_id)
    })
    if (follower_user === null) {
      await dbConnect.Followers.insertOne(
        new Follower({ followed_user_id: new ObjectId(followed_user_id), user_id: new ObjectId(user_id) })
      )
      return {
        message: USERS_MESSAGES.FOLLOWER_USER_SUCCESS
      }
    }
    return {
      message: USERS_MESSAGES.ALLREADLY_FOLLOWER_USER
    }
  }
  async unfollower(followed_user_id: string, user_id: string) {
    const follower_user = await dbConnect.Followers.findOne({
      followed_user_id: new ObjectId(followed_user_id),
      user_id: new ObjectId(user_id)
    })
    if (follower_user === null) {
      return {
        message: USERS_MESSAGES.ALLREADLY_UNFOLLOWER_USER
      }
    }
    await dbConnect.Followers.deleteOne({
      followed_user_id: new ObjectId(followed_user_id),
      user_id: new ObjectId(user_id)
    })
    return {
      message: USERS_MESSAGES.UNFOLLOWER_USER_SUCCESS
    }
  }
  async changePassword(user_id: string, password: string) {
    await dbConnect.user.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          password: hashPassword(password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS
    }
  }
}
const usersService = new UsersService()
export default usersService
