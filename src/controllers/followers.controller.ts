import { Request, Response } from 'express'
import { Pagination } from '~/models/request/Tweet.request'

import followwerServices from '~/services/follower.serveces'
export const followerListController = async (req: Request<any, any, any, Pagination>, res: Response) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const user_id = req.decoded_authorization?.user_id as string
  const params = {
    limit,
    page,
    user_id
  }
  const result = await followwerServices.followersList(params)

  return res.json({
    message: ' Get followers is successfully !',
    result
  })
}
