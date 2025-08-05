import { Request, Response, Router } from 'express'
import {
  createTweetController,
  getTweetDetailController,
  getTweetChildrenController,
  getNewFeedsController
} from '~/controllers/tweetscontroller'
import {
  audienceValidator,
  createTweetValidater,
  tweetValidater,
  getTweetChildrenValidator,
  paginationValidator
} from '~/middlewares/tweets.middleware'
import { isUserLoggedInvalidator, accessTokenValidater, verifyAccountValidater } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handles'

const tweetsRouter = Router()
tweetsRouter.post(
  '/',
  accessTokenValidater,
  verifyAccountValidater,
  createTweetValidater,
  wrapRequestHandler(createTweetController)
)
tweetsRouter.get(
  '/:tweet_id',
  isUserLoggedInvalidator(accessTokenValidater),
  isUserLoggedInvalidator(verifyAccountValidater),
  tweetValidater,
  audienceValidator,
  wrapRequestHandler(getTweetDetailController)
)

/**
 * Description: Get Tweet Children
 * Path: /:tweet_id/children
 * Method: GET
 * Header: { Authorization?: Bearer <access_token> }
 * Query: { limit: number, page: number, tweet_type: TweetType }
 */
tweetsRouter.get(
  '/:tweet_id/children',
  isUserLoggedInvalidator(accessTokenValidater),
  isUserLoggedInvalidator(verifyAccountValidater),
  tweetValidater,
  getTweetChildrenValidator,
  paginationValidator,
  audienceValidator,
  wrapRequestHandler(getTweetChildrenController)
)
/**
 * Description: Get new feeds
 * Path: /
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Query: { limit: number, page: number }
 */
tweetsRouter.get(
  '/',
  accessTokenValidater,
  verifyAccountValidater,
  paginationValidator,
  wrapRequestHandler(getNewFeedsController)
)
export default tweetsRouter
