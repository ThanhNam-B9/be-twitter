import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { Document, ObjectId } from 'mongodb'
import { TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enum'
import HTTPSTATUS from '~/constants/httpStatus'
import USERS_MESSAGES from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { Media, MediaType } from '~/models/Other'
import { TweetReqBody } from '~/models/request/Tweet.request'
import Tweet from '~/models/schemas/Tweet.schema'
import dbConnect from '~/services/database.services'
import { coverNumberToEnumType } from '~/utils/common'
import { wrapRequestHandler } from '~/utils/handles'
import { validate } from '~/utils/validation'
const tweetTypee = coverNumberToEnumType(TweetType)
const tweetAudience = coverNumberToEnumType(TweetAudience)
const tweetMedias = coverNumberToEnumType(MediaType)
const tweetType = coverNumberToEnumType(TweetType)
export const createTweetValidater = validate(
  checkSchema(
    {
      type: {
        isIn: { options: [tweetTypee], errorMessage: 'Invalid tweet type' }
      },
      audience: {
        isIn: { options: [tweetAudience], errorMessage: 'Invalid tweet type' }
      },
      parent_id: {
        custom: {
          options: async (value: string, { req }) => {
            const type = req.body.type as TweetType
            // nếu `type` là tweet thì `parent_id` phải là `null`
            if (type === TweetType.Tweet && value !== null) {
              // throw new ErrorWithStatus({
              //   message: 'Parent_id is must be null with type is tweet',
              //   status: HTTPSTATUS.UNAUTHORIZED
              // })
              throw new Error('Parent_id is must be null with type is tweet')
            }
            //Nếu `type` là retweet, comment, quotetweet thì `parent_id` phải là `tweet_id` của tweet cha
            if (
              [TweetType.Comment, TweetType.QuoteTweet, TweetType.Retweet].includes(type) &&
              !ObjectId.isValid(value)
            ) {
              throw new Error('Parent id is must be a valid tweet id')
            }
            return true
          }
        }
      },
      content: {
        isString: true,
        custom: {
          options: async (value: string, { req }) => {
            const { content, hashtags, mentions, type } = req.body as TweetReqBody
            // Nếu `type` là retweet thì `content` phải là `''`
            if (type === TweetType.Retweet && value !== '') {
              throw new Error('Content is must be empty with type is retweet')
            }
            // Nếu `type` là comment, quotetweet, tweet và không có `mentions` và `hashtags` thì `content` phải là string và không được rỗng.
            if (
              [TweetType.QuoteTweet, TweetType.Comment, TweetType.Tweet].includes(type) &&
              !isEmpty(hashtags) &&
              !isEmpty(mentions) &&
              value !== ''
            ) {
              throw new Error('Content is must be string and not a empty with type is not a retweet')
            }
            return true
          }
        }
      },
      hashtags: {
        isArray: true,
        custom: {
          options: (value: [], { req }) => {
            if (!value.every((item) => typeof item === 'string')) {
              throw new Error('Parent id is must be an array of string')
            }
            return true
          }
        }
      },
      mentions: {
        isArray: true,
        custom: {
          options: (value: [], { req }) => {
            if (!value.every((item) => ObjectId.isValid(item))) {
              throw new Error('Parent id is must be an array of string')
            }
            return true
          }
        }
      },
      medias: {
        isArray: true,
        custom: {
          options: (value: [], { req }) => {
            if (
              value.some((item: Media) => {
                return typeof item.url !== 'string' || !tweetMedias.includes(item.type)
              })
            ) {
              throw new Error('Medias is must be an array of type media')
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)
export const tweetValidater = validate(
  checkSchema({
    tweet_id: {
      // isMongoId:{
      //   errorMessage: "Invalide id mongodb"
      // },
      custom: {
        options: async (value: string, { req }) => {
          if (!ObjectId.isValid(value)) {
            throw new ErrorWithStatus({
              message: 'Invalid Tweet',
              status: HTTPSTATUS.NOT_FOUND
            })
          }
          const [tweet] = await dbConnect.Tweets.aggregate<Tweet>(
            [
              {
                $match: {
                  _id: new ObjectId(value)
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
                  bookmarks: { $size: '$bookmarks' },
                  likes: { $size: '$likes' },
                  retweet_count: {
                    $size: {
                      $filter: {
                        input: '$tweet_chidren',
                        as: 'item',
                        cond: { $eq: ['$$item.type', TweetType.Retweet] }
                      }
                    }
                  },
                  comment_count: {
                    $size: {
                      $filter: {
                        input: '$tweet_chidren',
                        as: 'item',
                        cond: { $eq: ['$$item.type', TweetType.Comment] }
                      }
                    }
                  },
                  quote_count: {
                    $size: {
                      $filter: {
                        input: '$tweet_chidren',
                        as: 'item',
                        cond: { $eq: ['$$item.type', TweetType.QuoteTweet] }
                      }
                    }
                  }
                }
              },
              { $project: { tweet_chidren: 0 } }
            ],
            { maxTimeMS: 60000, allowDiskUse: true }
          ).toArray()
          // console.log('tweet', tweet)
          if (!tweet) {
            throw new ErrorWithStatus({
              message: 'Not found tweet',
              status: HTTPSTATUS.NOT_FOUND
            })
          }
          ;(req as Request).tweet = tweet
          return true
        }
      }
    }
  })
)
// Muốn sử dụng asnyc await trong handle express thì pahỉ dùng try cacth
// Nếy không dùng try catch thì phải dùng wrapRequestHandler được customize để bắt lỗi mà không bị đứng ứng dựng

export const audienceValidator = wrapRequestHandler(async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet as Tweet
  if (tweet.audience === TweetAudience.TwitterCircle) {
    // Kiểm tra người xem đã đăng nhập hay chưa
    if (!req.decoded_authorization) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTPSTATUS.NOT_FOUND
      })
    }
    // Kiểm tra tác giả cong tồn tại hay chưa có bị ban không
    const author = await dbConnect.user.findOne({ _id: tweet.user_id })
    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTPSTATUS.NOT_FOUND
      })
    }
    // Kiểm tác này có nằm trong twitter circle và có phải là tác giả không
    const { user_id } = req.decoded_authorization
    // const Objuser_id = new ObjectId(user_id)
    // !author.twitter_circle.includes(Objuser_id) không nên sử để so sách object về nó sẽ so sánh của địa chỉ bỏ nhớ nên 2 obj giống nhau nhưng khác khởi tạo(khác địa chỉ) sẽ là false
    const isInTwitterCircle = author.twitter_circle.some((user_circle_id) => user_circle_id.equals(user_id))
    if (!isInTwitterCircle && !author._id.equals(user_id)) {
      throw new ErrorWithStatus({
        message: 'Tweet is not public',
        status: HTTPSTATUS.FORBIDDEN
      })
    }
  }
  next()
})

export const getTweetChildrenValidator = validate(
  checkSchema(
    {
      type_tweet: {
        isNumeric: true,
        isIn: {
          options: [tweetType],
          errorMessage: 'Invalid type tweet '
        }
      }
    },
    ['query']
  )
)
export const paginationValidator = validate(
  checkSchema(
    {
      limit: {
        isNumeric: true,
        custom: {
          options: (value, { req }) => {
            const limit = Number(value)
            if (limit > 100 || limit < 0) {
              throw new Error('limit< 100 or limit> 0')
            }
            return true
          }
        }
      },
      page: {
        isNumeric: true,
        custom: {
          options: (value, { req }) => {
            const page = Number(value)
            if (page < 0) {
              throw new Error(' page > 0')
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)
