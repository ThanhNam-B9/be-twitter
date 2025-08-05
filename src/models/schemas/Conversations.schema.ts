import { ObjectId } from 'mongodb'

interface ConversationType {
  _id?: ObjectId
  sender_id: ObjectId
  receiver_id: ObjectId
  messages: string
  updated_at?: Date
  created_at?: Date
}
export class Conversation {
  _id?: ObjectId
  sender_id: ObjectId
  receiver_id: ObjectId
  messages: string
  updated_at?: Date
  created_at?: Date
  constructor(conversation: ConversationType) {
    const date = new Date()
    this._id = conversation._id
    this.sender_id = conversation.sender_id
    this.receiver_id = conversation.receiver_id
    this.messages = conversation.messages
    this.updated_at = conversation.updated_at || date
    this.created_at = conversation.created_at || date
  }
}
