import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { LikeReqBody } from '~/models/request/Like.request'
import { TokenPayload } from '~/models/request/User.request'
import likesTweetServices from '~/services/likes.services'

export const likesTweetController = async (req: Request<ParamsDictionary, any, LikeReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.body as LikeReqBody
  const result = await likesTweetServices.likeTweet(tweet_id, user_id)
  return res.json(result)
}

export const unLikesTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const tweet_id = req.params.tweet_id as string
  const result = await likesTweetServices.unLikeTweet(tweet_id, user_id)
  return res.json(result)
}
