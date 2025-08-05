import { Request, Response } from 'express'
import { ConversatioReqParams } from '~/models/request/Conversation.request'
import { Pagination } from '~/models/request/Tweet.request'
import conversationServices from '~/services/conversation.services'
import searchServices from '~/services/search.services'
export const conversationsController = async (
  req: Request<ConversatioReqParams, any, any, Pagination>,
  res: Response
) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const { receiver_id } = req.params
  const user_id = req.decoded_authorization?.user_id as string
  const params = {
    limit,
    page,
    user_id,
    receiver_id
  }
  const result = await conversationServices.conversations(params)
  return res.json({
    message: ' Conversations is successfully !',
    result
  })
}
