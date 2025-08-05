import { Request, Response, Router } from 'express'
import { likesTweetController, unLikesTweetController } from '~/controllers/likes.controller'
import { createTweetController } from '~/controllers/tweetscontroller'
import { verifyEmailController } from '~/controllers/users.controller'
import { createTweetValidater, tweetValidater } from '~/middlewares/tweets.middleware'
import { accessTokenValidater, verifyAccountValidater } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handles'

const likesTweetsRouter = Router()
likesTweetsRouter.post(
  '',
  accessTokenValidater,
  verifyAccountValidater,
  tweetValidater,
  wrapRequestHandler(likesTweetController)
)
likesTweetsRouter.delete(
  '/tweets/:tweet_id',
  accessTokenValidater,
  verifyAccountValidater,
  tweetValidater,
  wrapRequestHandler(unLikesTweetController)
)

export default likesTweetsRouter
