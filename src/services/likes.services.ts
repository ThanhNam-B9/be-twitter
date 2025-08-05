import HTTPSTATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
import dbConnect from './database.services'
import { ObjectId } from 'mongodb'
import Like from '~/models/schemas/Likes.schema'

class LikesTweetServices {
  async likeTweet(tweet_id: string, user_id: string) {
    const result = await dbConnect.Likes.findOneAndUpdate(
      {
        tweet_id: new ObjectId(tweet_id),
        user_id: new ObjectId(user_id)
      },
      {
        $setOnInsert: new Like({
          tweet_id: new ObjectId(tweet_id),
          user_id: new ObjectId(user_id)
        })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return {
      message: 'Like Tweet successfully',
      result
    }
  }
  async unLikeTweet(tweet_id: string, user_id: string) {
    const result = await dbConnect.Likes.findOneAndDelete({
      tweet_id: new ObjectId(tweet_id),
      user_id: new ObjectId(user_id)
    })
    if (!result) {
      return {
        message: 'UnLiked Tweet or Like Tweet not exits',
        result
      }
    }
    return {
      message: 'UnLike Tweet successfully',
      result
    }
  }
}

const likesTweetServices = new LikesTweetServices()
export default likesTweetServices
