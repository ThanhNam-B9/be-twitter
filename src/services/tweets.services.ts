import { TweetReqBody } from '~/models/request/Tweet.request'
import dbConnect from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtags.schema'
import { TweetType } from '~/constants/enum'

class TweetServices {
  handleHashTags = async (hashtags: string[]) => {
    const result = await Promise.all(
      hashtags.map((hashtag: string) => {
        return dbConnect.Hashtags.findOneAndUpdate(
          { name: hashtag },
          {
            $setOnInsert: new Hashtag({ name: hashtag })
          },
          {
            upsert: true,
            returnDocument: 'after'
          }
        )
      })
    )
    return result.map((item) => (item as WithId<Hashtag>)._id)
  }

  async createTweet(body: TweetReqBody, user_id: string) {
    const hashtags = await this.handleHashTags(body.hashtags)

    const result = await dbConnect.Tweets.insertOne(
      new Tweet({
        user_id: new ObjectId(user_id),
        type: body.type,
        audience: body.audience,
        content: body.content,
        parent_id: body.parent_id,
        hashtags,
        mentions: body.mentions,
        medias: body.medias,
        guest_views: 0,
        user_views: 0
      })
    )
    const tweet = await dbConnect.Tweets.findOne({ _id: result.insertedId })
    return {
      message: 'Create tweet successfully',
      tweet
    }
  }
  async increaseView(tweet_id: string, user_id?: string) {
    const incView = user_id ? { user_views: 1 } : { guest_views: 1 }
    const result = (await dbConnect.Tweets.findOneAndUpdate(
      {
        _id: new ObjectId(tweet_id)
      },
      {
        $inc: incView,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          user_views: 1,
          guest_views: 1,
          updated_at: 1
        }
      }
    )) as WithId<{
      guest_views: number
      user_views: number
      updated_at: Date
    }>
    return result
  }
  async getTweetChildren({
    tweet_id,
    limit,
    page,
    type_tweet,
    user_id
  }: {
    tweet_id: string
    limit: number
    page: number
    type_tweet: TweetType
    user_id?: string
  }) {
    const tweets = await dbConnect.Tweets.aggregate<Tweet>([
      {
        $match: {
          parent_id: new ObjectId(tweet_id),
          type: type_tweet
        }
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
          as: 'tweet_children'
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
                input: '$tweet_children',
                as: 'item',
                cond: {
                  $eq: ['$$item.type', TweetType.Retweet]
                }
              }
            }
          },
          comment_count: {
            $size: {
              $filter: {
                input: '$tweet_children',
                as: 'item',
                cond: {
                  $eq: ['$$item.type', TweetType.Comment]
                }
              }
            }
          },
          quote_count: {
            $size: {
              $filter: {
                input: '$tweet_children',
                as: 'item',
                cond: {
                  $eq: ['$$item.type', TweetType.QuoteTweet]
                }
              }
            }
          }
        }
      },
      {
        $project: {
          tweet_children: 0
        }
      },
      {
        $skip: limit * (page - 1) // Công thức phân trang
      },
      {
        $limit: limit
      }
    ]).toArray()

    const ins = await tweets.map((tweet) => tweet._id as ObjectId)
    const date = new Date()
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    console.log('u', user_id)

    const [, totalPage] = await Promise.all([
      dbConnect.Tweets.updateMany(
        {
          _id: {
            $in: ins
          }
        },
        {
          $inc: inc,
          $set: {
            updated_at: date
          }
        }
      ),
      dbConnect.Tweets.countDocuments({
        parent_id: new ObjectId(tweet_id),
        type: type_tweet
      })
    ])
    // tweets.forEach((tweet) => {
    //   tweet.updated_at = date
    //   if (user_id) {
    //     tweet.user_views = +1
    //   } else {
    //     tweet.guest_views = +1
    //   }
    // }) tối vì không phải gọi db
    const _tweets = await dbConnect.Tweets.aggregate<Tweet>([
      {
        $match: {
          parent_id: new ObjectId(tweet_id),
          type: type_tweet
        }
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
          as: 'tweet_children'
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
                input: '$tweet_children',
                as: 'item',
                cond: {
                  $eq: ['$$item.type', TweetType.Retweet]
                }
              }
            }
          },
          comment_count: {
            $size: {
              $filter: {
                input: '$tweet_children',
                as: 'item',
                cond: {
                  $eq: ['$$item.type', TweetType.Comment]
                }
              }
            }
          },
          quote_count: {
            $size: {
              $filter: {
                input: '$tweet_children',
                as: 'item',
                cond: {
                  $eq: ['$$item.type', TweetType.QuoteTweet]
                }
              }
            }
          }
        }
      },
      {
        $project: {
          tweet_children: 0
        }
      },
      {
        $skip: limit * (page - 1) // Công thức phân trang
      },
      {
        $limit: limit
      }
    ]).toArray()
    return {
      _tweets,
      limit,
      page,
      totalPage: Math.ceil(totalPage / limit)
    }
  }
  async getNewFeeds({ limit, page, user_id }: { limit: number; page: number; user_id: string }) {
    const user_followed_ids = await dbConnect.Followers.find(
      {
        user_id: new ObjectId(user_id)
      },
      {
        projection: {
          followed_user_id: 1,
          _id: 0
        }
      }
    ).toArray()
    const ids = user_followed_ids.map((item) => item.followed_user_id)
    ids.push(new ObjectId(user_id))
    const result = await dbConnect.Tweets.aggregate([
      {
        $match: {
          user_id: {
            $in: ids
          }
        }
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
              user_id: new ObjectId(user_id)
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
                    $in: [new ObjectId(user_id)]
                  }
                }
              ]
            }
          ]
        }
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
                  $eq: ['$$item.type', TweetType.Retweet]
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
                  $eq: ['$$item.type', TweetType.Comment]
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
                  $eq: ['$$item.type', TweetType.QuoteTweet]
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
      },
      {
        $skip: limit * (page - 1)
      },
      {
        $limit: limit
      }
    ]).toArray()

    return result
  }
}
const tweetServices = new TweetServices()
export default tweetServices
