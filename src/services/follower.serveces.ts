import { ConversatioReqParams } from '~/models/request/Conversation.request'
import { Pagination } from '~/models/request/Tweet.request'
import dbConnect from './database.services'
import { ObjectId } from 'mongodb'
import Follower from '~/models/schemas/Followers.shema'

class FollowwerServices {
  async followersList({ limit, page, user_id }: { limit: number; page: number; user_id: string }) {
    const result = await dbConnect.Followers.aggregate<Follower>([
      {
        $addFields: {
          user_id: new ObjectId(user_id)
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'followed_user_id',
          foreignField: '_id',
          as: 'follower'
        }
      },
      {
        $project:
          /**
           * specifications: The fields to
           *   include or exclude.
           */
          {
            follower: {
              $map: {
                input: '$follower',
                as: 'follower',
                in: {
                  _id: '$$follower._id',
                  email: '$$follower.email',
                  name: '$$follower.name',
                  username: '$$follower.username',
                  avatar: '$$follower.avatar'
                }
              }
            }
          }
      },
      {
        $skip: (page - 1) * limit
      },
      {
        $limit: limit
      }
    ]).toArray()
    return result
  }
}
const followwerServices = new FollowwerServices()
export default followwerServices
