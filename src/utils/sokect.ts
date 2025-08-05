import { Server } from 'socket.io'
import { Server as ServerHttp } from 'http'
import { verifyAccessToken } from './common'
import { TokenPayload } from '~/models/request/User.request'
import { ErrorWithStatus } from '~/models/Errors'
import { UserVerifyStatus } from '~/constants/enum'
import USERS_MESSAGES from '~/constants/messages'
import HTTPSTATUS from '~/constants/httpStatus'
import { Conversation } from '~/models/schemas/Conversations.schema'
import { ObjectId } from 'mongodb'
import dbConnect from '~/services/database.services'

export const initSocket = (httpServer: ServerHttp) => {
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3000'
    }
  })
  const users: {
    [key: string]: {
      sokect_id: string
    }
  } = {}
  io.use(async (socket, next) => {
    const { Authorization } = socket.handshake.auth
    const access_token = Authorization?.split(' ')[1]
    try {
      const decoded_authorization = (await verifyAccessToken(access_token)) as TokenPayload
      const { verify } = decoded_authorization
      if (verify !== UserVerifyStatus.Verified) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.USER_NOT_VERIFY,
          status: HTTPSTATUS.FORBIDDEN
        })
      }
      socket.handshake.auth.decoded_authorization = decoded_authorization
      socket.handshake.auth.access_token = access_token
      next()
    } catch (error) {
      console.log('error', error)
      next({
        message: 'Unauthorized',
        name: 'UnauthorizedError',
        data: error
      })
    }
  })

  io.on('connection', (socket) => {
    console.log(`user ${socket.id} connected`)
    const { user_id } = socket.handshake.auth.decoded_authorization as TokenPayload
    // const user_id = socket.handshake.auth._id
    users[user_id] = {
      sokect_id: socket.id
    }
    socket.use(async (pakect, next) => {
      try {
        const { access_token } = socket.handshake.auth
        await verifyAccessToken(access_token)
        next()
      } catch (error) {
        next(new Error('Unauthorized'))
      }
    })
    socket.on('error', (error) => {
      if (error.message === 'Unauthorized') {
        socket.disconnect()
      }
    })
    console.log('oke', users)
    socket.on('send_messages', async (data) => {
      console.log('vo day')
      const { sender_id, receiver_id, messages } = data.payload
      const receiver_sokect_id = users[receiver_id]?.sokect_id

      const conversation = new Conversation({
        sender_id: new ObjectId(sender_id),
        receiver_id: new ObjectId(receiver_id),
        messages
      })

      const result = await dbConnect.Conversations.insertOne(conversation)
      conversation._id = result.insertedId
      if (receiver_sokect_id) {
        socket.to(receiver_sokect_id).emit('receive_messages', {
          payload: conversation
        })
      }
    })

    socket.on('disconnect', () => {
      delete users[user_id]
      console.log(`user ${socket.id} disconnected`)
      // console.log('user del', users)
    })
  })
}
