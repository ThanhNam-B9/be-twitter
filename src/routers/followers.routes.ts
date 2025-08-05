import { Router } from 'express'
import { followerListController } from '~/controllers/followers.controller'
import { paginationValidator } from '~/middlewares/tweets.middleware'
import { accessTokenValidater, verifyAccountValidater } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handles'

const followersRouter = Router()
followersRouter.get(
  '/',
  //   accessTokenValidater,
  //   verifyAccountValidater,
  //   paginationValidator,
  wrapRequestHandler(followerListController)
)
export default followersRouter
