import express from 'express'
import userRouter from './routers/users.routes'
import dbConnect from './services/database.services'
import defaultErrorHandle from './middlewares/error.middleware'
import { config } from 'dotenv'

import { initFolderUploads } from './utils/file'
import mediaRouter from './routers/medias.routes'
import staticRouter from './routers/static.routes'
import tweetsRouter from './routers/tweets.routes'
import bookmarksTweetRouter from './routers/bookmarks.routes'
import likesTweetsRouter from './routers/likes.routes'
import searchTweetsRouter from './routers/search.routes'
// socket.io
import { createServer } from 'http'
import cors, { CorsOptions } from 'cors'
import conversationsRouter from './routers/conversations.routes'
import { initSocket } from './utils/sokect'
// import './utils/fake'
// swagger
import swaggerUi from 'swagger-ui-express'
import fs from 'fs'
import YAML from 'yaml'
import path from 'path'
import swaggerJSDoc from 'swagger-jsdoc'
import { envConfig, isProduction } from './constants/config'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import followersRouter from './routers/followers.routes'
config()
const app = express()
app.set('trust proxy', 1)
// const file = fs.readFileSync(path.resolve('twitter_swagger.yaml'), 'utf8')
// const swaggerDocument = YAML.parse(file)
const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Twitter clone Typesript 2024',
      version: '1.0.11'
    }
    // components: {
    //   securitySchemes: {
    //     BearerAuth: {
    //       type: 'http',
    //       scheme: 'bearer',
    //       bearerFormat: 'JWT'
    //     }
    //   }
    // }
  },
  // apis: ['./src/routers/*.routes.ts', './src/models/request/*.request.ts']
  // apis: ['./twitter_swagger.yaml']
  apis: ['./src/openapi/*.yaml']
}
const openapiSpecification = swaggerJSDoc(options)
const httpServer = createServer(app)
const corsOrigins: CorsOptions = {
  origin: isProduction ? envConfig.clientUrl : '*'
}
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
})

app.use(limiter)
app.use(helmet())
app.use(cors(corsOrigins))

const port = envConfig.port
// tạo folder tự động
initFolderUploads()
dbConnect.connect().then(() => {
  dbConnect.indexUser()
  dbConnect.indexRefreshToken()
  dbConnect.indexFollowers()
  dbConnect.indexTweets()
})
// app.use('/static', express.static(path.resolve(UPLOAD_FILE_DIR_NEW)))
app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))
app.use('/user', userRouter)
app.use('/medias', mediaRouter)
app.use('/static', staticRouter)
app.use('/tweets', tweetsRouter)
app.use('/bookmarks', bookmarksTweetRouter)
app.use('/likes', likesTweetsRouter)
app.use('/search', searchTweetsRouter)
app.use('/conversations', conversationsRouter)
app.use('/followers', followersRouter)

app.use(defaultErrorHandle)
initSocket(httpServer)
httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
