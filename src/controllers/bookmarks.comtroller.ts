import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { BookmarkReqBody } from '~/models/request/Bookmark.request'
import { TokenPayload } from '~/models/request/User.request'
import bookmarkTweetServices from '~/services/bookmarks.services'

export const bookmarkTweetController = async (req: Request<ParamsDictionary, any, BookmarkReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.body as BookmarkReqBody
  const result = await bookmarkTweetServices.bookmarkTweet(tweet_id, user_id)
  return res.json(result)
}

export const unBookmarkTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const tweet_id = req.params.tweet_id as string
  const result = await bookmarkTweetServices.unBookmarkTweet(tweet_id, user_id)
  return res.json(result)
}

export const unBookmarkTweetByIdBookmarkController = async (req: Request, res: Response) => {
  const bookmark_id = req.params.bookmark_id as string
  const result = await bookmarkTweetServices.unBookmarkTweetById(bookmark_id)
  return res.json(result)
}
