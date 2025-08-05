import { Request } from 'express'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { envConfig, isProduction } from '~/constants/config'
import { UPLOAD_IMAGES_FILE_DIR, UPLOAD_IMAGES_FILE_DIR_TEMP } from '~/constants/dir'
import { Media, MediaType } from '~/models/Other'

import { getNameFormFullName, handleUploadImage, handleUploadVideo } from '~/utils/file'
class MediasServices {
  uploadImages = async (req: Request) => {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const nameNew = getNameFormFullName(file.newFilename)
        const nameJpg = `${nameNew}.jpg`
        const namePath = path.resolve(UPLOAD_IMAGES_FILE_DIR, nameJpg)
        sharp.cache(false)
        await sharp(file.filepath).jpeg({}).toFile(namePath)
        fs.unlinkSync(file.filepath)
        const urlImage = !isProduction
          ? `http://localhost:${envConfig.port}/static/image/${nameJpg}`
          : `${envConfig.host}/static/image/${nameJpg}`
        return {
          url: urlImage,
          type: MediaType.Image
        }
      })
    )
    return result
  }
  uploadVideo = async (req: Request) => {
    const files = await handleUploadVideo(req)
    const result = await Promise.all(
      files.map((file) => {
        const url = !isProduction
          ? `http://localhost:${envConfig.host}/static/video/${file.newFilename}`
          : `${envConfig.host}/static/image/${file.newFilename}`

        return {
          url,
          type: MediaType.Video
        }
      })
    )
    return result
  }
}
const mediasServices = new MediasServices()
export default mediasServices
