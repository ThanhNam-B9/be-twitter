import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TweetType } from '~/constants/enum'
import { Pagination, TweetReqBody, TweetReqParams, TweetReqQuery } from '~/models/request/Tweet.request'
import { TokenPayload } from '~/models/request/User.request'
import tweetServices from '~/services/tweets.services'

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req
  const result = await tweetServices.createTweet(body, user_id)
  return res.json(result)
}

export const getTweetDetailController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.params

  const result = await tweetServices.increaseView(tweet_id, user_id)
  const tweetRes = {
    ...req.tweet,
    ...result
  }
  return res.json({
    message: 'Get tweet detail successfully',
    result: tweetRes
  })
}

export const getTweetChildrenController = async (
  req: Request<TweetReqParams, any, any, TweetReqQuery>,
  res: Response
) => {
  const { tweet_id } = req.params
  const { limit, page, type_tweet } = req.query
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetServices.getTweetChildren({
    limit: Number(limit),
    page: Number(page),
    type_tweet: Number(type_tweet) as TweetType,
    tweet_id,
    user_id
  })

  return res.json({
    message: 'Get tweet detail successfully',
    result
  })
}
export const getNewFeedsController = async (req: Request<ParamsDictionary, any, any, Pagination>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const body = {
    limit,
    page,
    user_id
  }
  const result = await tweetServices.getNewFeeds(body)

  return res.json({
    message: 'Get tweet detail successfully',
    result
  })
}
