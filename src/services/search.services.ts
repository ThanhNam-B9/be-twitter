import { SearchType } from '~/models/request/Search.request'
import { Pagination } from '~/models/request/Tweet.request'
import dbConnect from './database.services'
import { ObjectId } from 'mongodb'
import { TweetType } from '~/constants/enum'
import { MediaTypeReq } from '~/models/Other'

class SearchServices {
  async search({
    limit,
    page,
    content,
    user_id,
    media_type
  }: {
    limit: number
    page: number
    content: string
    user_id: string
    media_type: MediaTypeReq
  }) {
    const user_id_obj = new ObjectId(user_id)
    const $match: any = {
      $text: {
        $search: content
      }
    }
    if (media_type === MediaTypeReq.Image) {
      $match['medias.type'] = 0
    } else if (media_type === MediaTypeReq.Video) {
      $match['medias.type'] = 1
    }
    const [tweets, total] = await Promise.all([
      dbConnect.Tweets.aggregate([
        {
          $match
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: {
            path: '$user'
          }
        },
        {
          $match: {
            $or: [
              {
                user_id: user_id_obj
              },
              {
                audience: 0
              },
              {
                $and: [
                  {
                    audience: 1
                  },
                  {
                    'user.twitter_circle': {
                      $in: [user_id_obj]
                    }
                  }
                ]
              }
            ]
          }
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        },
        {
          $lookup: {
            from: 'hashtags',
            localField: 'hashtags',
            foreignField: '_id',
            as: 'hashtags'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'mentions',
            foreignField: '_id',
            as: 'mentions'
          }
        },
        {
          $addFields: {
            mentions: {
              $map: {
                input: '$mentions',
                as: 'mention',
                in: {
                  _id: '$$mention._id',
                  name: '$$mention.name',
                  username: '$$mention.username',
                  email: '$$mention.email'
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'bookmarks',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'bookmarks'
          }
        },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'likes'
          }
        },
        {
          $lookup: {
            from: 'tweets',
            localField: '_id',
            foreignField: 'parent_id',
            as: 'tweet_chidren'
          }
        },
        {
          $addFields: {
            bookmarks: {
              $size: '$bookmarks'
            },
            likes: {
              $size: '$likes'
            },
            retweet_count: {
              $size: {
                $filter: {
                  input: '$tweet_chidren',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', 1]
                  }
                }
              }
            },
            comment_count: {
              $size: {
                $filter: {
                  input: '$tweet_chidren',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', 2]
                  }
                }
              }
            },
            quote_count: {
              $size: {
                $filter: {
                  input: '$tweet_chidren',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', 3]
                  }
                }
              }
            }
          }
        },
        {
          $project: {
            tweet_chidren: 0,
            user: {
              password: 0,
              date_of_birth: 0,
              email_verify_token: 0,
              forgot_password_token: 0,
              verify: 0,
              twitter_circle: 0
            }
          }
        }
      ]).toArray(),
      dbConnect.Tweets.aggregate([
        {
          $match: {
            $text: {
              $search: content
            }
          }
        },
        {
          $count: 'total'
        }
      ]).toArray()
    ])
    const ids = tweets.map((item) => item._id as ObjectId)
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const date = new Date()
    await dbConnect.Tweets.updateMany(
      {
        _id: {
          $in: ids
        }
      },
      {
        $inc: inc,
        $set: {
          updated_at: date
        }
      }
    )
    tweets.forEach((tweet) => {
      tweet.updated_at = date
      tweet.user_views = tweet.user_views + 1
    })
    let totalPage = 0

    if (total.length > 0) {
      totalPage = Math.ceil(total[0].total / limit)
    }
    return {
      tweets,
      limit,
      page,
      totalPage
    }
  }
}

const searchServices = new SearchServices()
export default searchServices
