import { ConversatioReqParams } from '~/models/request/Conversation.request'
import { Pagination } from '~/models/request/Tweet.request'
import dbConnect from './database.services'
import { ObjectId } from 'mongodb'

class ConversationServices {
  async conversations({
    limit,
    page,
    receiver_id,
    user_id
  }: {
    limit: number
    page: number
    user_id: string
    receiver_id: string
  }) {
    const conversations = await dbConnect.Conversations.find({
      $or: [
        {
          sender_id: new ObjectId(user_id),
          receiver_id: new ObjectId(receiver_id)
        },
        {
          sender_id: new ObjectId(receiver_id),
          receiver_id: new ObjectId(user_id)
        }
      ]
    })
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    const total = await dbConnect.Conversations.countDocuments({
      $or: [
        {
          sender_id: new ObjectId(user_id),
          receiver_id: new ObjectId(receiver_id)
        },
        {
          sender_id: new ObjectId(receiver_id),
          receiver_id: new ObjectId(user_id)
        }
      ]
    })
    const totalPages = Math.ceil(total / limit) || 0
    const result = {
      conversations,
      limit,
      page,
      totalPages
    }
    return result
  }
}
const conversationServices = new ConversationServices()
export default conversationServices
