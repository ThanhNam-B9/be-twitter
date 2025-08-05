import { Router } from 'express'
import {
  bookmarkTweetController,
  unBookmarkTweetController,
  unBookmarkTweetByIdBookmarkController
} from '~/controllers/bookmarks.comtroller'
import { tweetValidater } from '~/middlewares/tweets.middleware'
import { accessTokenValidater, verifyAccountValidater } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handles'

const bookmarksTweetRouter = Router()
bookmarksTweetRouter.post(
  '',
  accessTokenValidater,
  verifyAccountValidater,
  tweetValidater,
  wrapRequestHandler(bookmarkTweetController)
)
bookmarksTweetRouter.delete(
  '/tweets/:tweet_id',
  accessTokenValidater,
  verifyAccountValidater,
  tweetValidater,
  wrapRequestHandler(unBookmarkTweetController)
)
bookmarksTweetRouter.delete(
  '/:bookmark_id',
  accessTokenValidater,
  verifyAccountValidater,
  tweetValidater,
  wrapRequestHandler(unBookmarkTweetByIdBookmarkController)
)

export default bookmarksTweetRouter
