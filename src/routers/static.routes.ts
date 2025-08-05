import { Router } from 'express'

import { staticImageController, staticVideoStreamController } from '~/controllers/static.controller'

const staticRouter = Router()
staticRouter.get('/image/:name', staticImageController)
staticRouter.get('/video-stream/:name', staticVideoStreamController)

export default staticRouter
