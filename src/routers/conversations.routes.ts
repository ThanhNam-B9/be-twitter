import { Router } from 'express'
import { conversationsController } from '~/controllers/conversations.controller'
import { conversationsValidator } from '~/middlewares/conversations.middleware'
import { paginationValidator } from '~/middlewares/tweets.middleware'
import { accessTokenValidater, verifyAccountValidater } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handles'

const conversationsRouter = Router()
conversationsRouter.get(
  '/receiver/:receiver_id',
  accessTokenValidater,
  verifyAccountValidater,
  paginationValidator,
  conversationsValidator,
  wrapRequestHandler(conversationsController)
)
export default conversationsRouter
