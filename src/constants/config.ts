import { config } from 'dotenv'
import path from 'path'
import fs from 'fs'
const env = process.env.NODE_ENV?.trim() || 'development'
if (!env) {
  console.log(`Bạn chưa cung cấp biến môi trường NODE_ENV (ví dụ: development, production)`)
  console.log(`Phát hiện NODE_ENV = ${env}`)
  process.exit(1)
}
const envFilePath = `.env.${env}`

console.log(`envFilename: ${envFilePath}`)
console.log(`Phát hiện NODE_ENV = ${env}, vì thế app sẽ dùng file môi trường là ${envFilePath}`)

if (!fs.existsSync(path.resolve(envFilePath))) {
  console.log(`Không tìm thấy file môi trường ${envFilePath}`)
  console.log(`Lưu ý: App không dùng file .env, ví dụ môi trường là development thì app sẽ dùng file .env.development`)
  console.log(`Vui lòng tạo file ${envFilePath} và tham khảo nội dung ở file .env.example`)
  process.exit(1)
}

config({
  path: envFilePath
})

export const isProduction = env
// export const isProduction = env === 'production'

export const envConfig = {
  port: process.env.PORT || 4000,
  host: process.env.HOST,
  dbUserName: process.env.DB_USERNAME,
  dbPassword: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  dbUserCollection: process.env.DB_USER_COLLECTION,
  dbRefreshTokenCollection: process.env.DB_REFRESHTOKEN_COLLECTION,
  dbFollowersCollection: process.env.DB_FOLLOWERS_COLLECTION,
  dbTweetsCollection: process.env.DB_TWEETS_COLLECTION,
  dbHashtagsCollection: process.env.DB_HASHTAGS_COLLECTION,
  dbBookmarksCollection: process.env.DB_BOOKMARKS_COLLECTION,
  dbLikesCollection: process.env.DB_LIKES_COLLECTION,
  dbConversationsCollection: process.env.DB_CONVERSATION_COLLECTION,
  passwordSecret: process.env.PASSWORD_SECRET,
  jwtSecretAccessToken: process.env.JWT_SECRET_ACCESS_TOKEN,
  jwSecretRefreshToken: process.env.JWT_SECRET_REFRESH_TOKEN,
  jwtSecretEmailVerifyToken: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN,
  jwtSecretForgotPasswordToken: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN,
  expiredRefreshToken: process.env.EXPIRED_REFRESH_TOKEN,
  expiredAccessToken: process.env.EXPIRED_ACCESS_TOKEN,
  expiredVerifyEmailToken: process.env.EXPIRED_VERIFY_EMAIL_TOKEN,
  expiredForgotPasswordToken: process.env.EXPIRED_FOR,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  clientRedirectCallback: process.env.CLIENT_REDIRECT_CALLBACK,
  clientUrl: process.env.CLIENT_URL
}
