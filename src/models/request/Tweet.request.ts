import { TweetAudience, TweetType } from '~/constants/enum'
import { Media } from '../Other'
import { ParamsDictionary, Query } from 'express-serve-static-core'

export interface TweetReqBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string //  chỉ null khi tweet gốc, không thì là tweet_id cha dạng string
  hashtags: string[] // tên của hashtag dạng ['javascript', 'reactjs']
  mentions: string[]
  medias: Media[] // user_id[]
}
export interface TweetReqParams extends ParamsDictionary {
  tweet_id: string
}
export interface TweetReqQuery extends Query, Pagination {
  type_tweet: string
}
export interface Pagination {
  limit: string
  page: string
}
