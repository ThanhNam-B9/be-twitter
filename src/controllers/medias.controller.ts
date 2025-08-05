import { NextFunction, Request, Response } from 'express'
import USERS_MESSAGES from '~/constants/messages'
import mediasServices from '~/services/medias.services'

export const uploadImagesController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediasServices.uploadImages(req)
  res.json({
    messages: USERS_MESSAGES.UPLOAD_IMGAE_SUCCESS,
    result
  })
}

export const uploadVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediasServices.uploadVideo(req)
  res.json({
    messages: USERS_MESSAGES.UPLOAD_IMGAE_SUCCESS,
    result
  })
}
