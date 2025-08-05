import { Router } from 'express'
import { uploadImagesController, uploadVideoController } from '~/controllers/medias.controller'
import { accessTokenValidater, verifyAccountValidater } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handles'

const mediaRouter = Router()
mediaRouter.post(
  '/upload-images',
  accessTokenValidater,
  verifyAccountValidater,
  wrapRequestHandler(uploadImagesController)
)
mediaRouter.post(
  '/upload-video',
  accessTokenValidater,
  verifyAccountValidater,
  wrapRequestHandler(uploadVideoController)
)

export default mediaRouter
