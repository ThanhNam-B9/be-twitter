import { ObjectId } from 'mongodb'
import dbConnect from './database.services'
import { ErrorWithStatus } from '~/models/Errors'
import HTTPSTATUS from '~/constants/httpStatus'
import Bookmark from '~/models/schemas/Bookmarks.schema'

class BookmarkTweetServices {
  async bookmarkTweet(tweet_id: string, user_id: string) {
    const result = await dbConnect.Bookmarks.findOneAndUpdate(
      {
        tweet_id: new ObjectId(tweet_id),
        user_id: new ObjectId(user_id)
      },
      {
        $setOnInsert: new Bookmark({
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
      message: 'Bookmark Tweet successfully',
      result
    }
  }
  async unBookmarkTweet(tweet_id: string, user_id: string) {
    const result = await dbConnect.Bookmarks.findOneAndDelete({
      tweet_id: new ObjectId(tweet_id),
      user_id: new ObjectId(user_id)
    })
    if (!result) {
      return {
        message: 'Unbookmarked Tweet or Bookmark Tweet not exits',
        result
      }
    }
    return {
      message: 'Unbookmark Tweet successfully',
      result
    }
  }
  async unBookmarkTweetById(bookmark_id: string) {
    const result = await dbConnect.Bookmarks.findOneAndDelete({
      _id: new ObjectId(bookmark_id)
    })
    if (!result) {
      return {
        message: 'Unbookmarked Tweet or Bookmark Tweet not exits',
        result
      }
    }
    return {
      message: 'Unbookmark Tweet successfully',
      result
    }
  }
}

const bookmarkTweetServices = new BookmarkTweetServices()
export default bookmarkTweetServices
