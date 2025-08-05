import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb'
import { config } from 'dotenv'
import User from '~/models/schemas/Users.schema'
import RefreshToken from '~/models/schemas/RefreshToken.shema'
import Follower from '~/models/schemas/Followers.shema'
import Tweet from '~/models/schemas/Tweet.schema'
import Hashtag from '~/models/schemas/Hashtags.schema'
import Bookmark from '~/models/schemas/Bookmarks.schema'
import Like from '~/models/schemas/Likes.schema'
import { Conversation } from '~/models/schemas/Conversations.schema'
import { envConfig } from '~/constants/config'
const uri = `mongodb+srv://${envConfig.dbUserName}:${envConfig.dbPassword}@twitter.cna4peh.mongodb.net/?retryWrites=true&w=majority&appName=Twitter`
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
/*const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})
export async function run() {
  try {
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 })
    console.log('Pinged your deployment. You successfully connected to MongoDB!')
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close()
  }
}*/

class DatabaseService {
  private client
  private db
  constructor() {
    this.client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        // strict: true,

        deprecationErrors: true
      }
    })
    this.db = this.client.db(envConfig.dbName)
  }
  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log(error)
      throw error
    }
  }
  async indexUser() {
    const isExits = await this.user.indexExists(['email_1_password_1', 'email_1', 'username_1'])

    if (!isExits) {
      this.user.createIndex({ email: 1, password: 1 })
      this.user.createIndex({ username: 1 }, { unique: true })
      this.user.createIndex({ email: 1 }, { unique: true })
    }
  }
  async indexFollowers() {
    const isExits = await this.Followers.indexExists(['followed_user_id_1_user_id_1'])
    if (!isExits) {
      this.Followers.createIndex({ followed_user_id: 1, user_id: 1 })
    }
  }
  async indexRefreshToken() {
    const isExits = await this.RefreshToken.indexExists(['token_1'])
    if (!isExits) {
      this.RefreshToken.createIndex({ token: 1 }, { unique: true })
    }
    this.RefreshToken.createIndex({ exp: 1 }, { expireAfterSeconds: 0 })
  }
  async indexTweets() {
    const isExits = await this.Tweets.indexExists(['content_text'])
    if (!isExits) {
      this.Tweets.createIndex({ content: 'text' }, { default_language: '' })
    }
  }
  get user(): Collection<User> {
    return this.db.collection(envConfig.dbUserCollection as string)
  }
  get RefreshToken(): Collection<RefreshToken> {
    return this.db.collection(envConfig.dbRefreshTokenCollection as string)
  }
  get Followers(): Collection<Follower> {
    return this.db.collection(envConfig.dbFollowersCollection as string)
  }
  get Tweets(): Collection<Tweet> {
    return this.db.collection(envConfig.dbTweetsCollection as string)
  }
  get Hashtags(): Collection<Hashtag> {
    return this.db.collection(envConfig.dbHashtagsCollection as string)
  }
  get Bookmarks(): Collection<Bookmark> {
    return this.db.collection(envConfig.dbBookmarksCollection as string)
  }
  get Likes(): Collection<Like> {
    return this.db.collection(envConfig.dbLikesCollection as string)
  }
  get Conversations(): Collection<Conversation> {
    return this.db.collection(envConfig.dbConversationsCollection as string)
  }
}
const dbConnect = new DatabaseService()
export default dbConnect
