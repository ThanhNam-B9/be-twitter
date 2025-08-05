import express from 'express'
import {
  loginController,
  logoutController,
  registerController,
  verifyEmailController,
  rendVerifyEmaillController,
  forgotPasswordController,
  verifyForgotPasswordController,
  resetPasswordController,
  getMeController,
  updateMeController,
  getProfileMeController,
  followerController,
  unfollowerController,
  changePasswordController,
  oauthController,
  refreshTokenController
} from '~/controllers/users.controller'
import { filterMiddlewware } from '~/middlewares/commom.middleware'
import {
  accessTokenValidater,
  emailVerifyTokenValidater,
  forgotPasswordValidater,
  loginValidater,
  refreshAccessTokenValidater,
  registerValidater,
  verifyForgotPasswordValidater,
  resetPasswordValidater,
  verifyAccountValidater,
  updatMeValidater,
  followerValidator,
  unfollowerValidator,
  changPasswordValidater
} from '~/middlewares/users.middleware'
import { UpdateMeReqBody } from '~/models/request/User.request'
import { wrapRequestHandler } from '~/utils/handles'
const userRouter = express.Router()

const timeLog = (req: any, res: any, next: any) => {
  console.log('Time: ', Date.now())
  next()
}

userRouter.use(timeLog)

userRouter.post('/register', registerValidater, wrapRequestHandler(registerController))
/**
 * @swagger
 * /user/login:
 *   post:
 *     tags:
 *       - users
 *     summary: Login
 *     description: User logs into systems
 *     operationId: login
 *     requestBody:
 *       description: Login an existent user in the systems
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginBody'
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Login success !'
 *                 result:
 *                   $ref: '#/components/schemas/SuccessAuthentication'
 *       '400':
 *         description: Bad request
 *       '422':
 *         description: Validation exception
 */
userRouter.post('/login', loginValidater, wrapRequestHandler(loginController))
userRouter.post('/refresh-token', refreshAccessTokenValidater, wrapRequestHandler(refreshTokenController))

userRouter.get('/oauth/google', wrapRequestHandler(oauthController))

userRouter.post('/logout', accessTokenValidater, refreshAccessTokenValidater, wrapRequestHandler(logoutController))
userRouter.post('/verify-email', emailVerifyTokenValidater, wrapRequestHandler(verifyEmailController))
userRouter.get('/resend-verify-email', accessTokenValidater, wrapRequestHandler(rendVerifyEmaillController))
userRouter.post('/forgot-password', forgotPasswordValidater, wrapRequestHandler(forgotPasswordController))
userRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordValidater,
  wrapRequestHandler(verifyForgotPasswordController)
)

userRouter.post('/reset-password', resetPasswordValidater, wrapRequestHandler(resetPasswordController))
userRouter.get('/me', accessTokenValidater, wrapRequestHandler(getMeController))
userRouter.patch(
  '/me',
  accessTokenValidater,
  verifyAccountValidater,
  filterMiddlewware<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ]),
  updatMeValidater,
  wrapRequestHandler(updateMeController)
)
userRouter.get('/:username', wrapRequestHandler(getProfileMeController))
userRouter.post(
  '/follower',
  accessTokenValidater,
  verifyAccountValidater,
  followerValidator,
  wrapRequestHandler(followerController)
)
userRouter.delete(
  '/follower/:user_id',
  accessTokenValidater,
  verifyAccountValidater,
  unfollowerValidator,
  wrapRequestHandler(unfollowerController)
)

userRouter.put(
  '/change-password',
  accessTokenValidater,
  verifyAccountValidater,
  changPasswordValidater,
  wrapRequestHandler(changePasswordController)
)

export default userRouter
