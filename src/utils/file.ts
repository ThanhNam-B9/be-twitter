import fs from 'fs'
import path, { resolve } from 'path'
import formidable, { File, Files } from 'formidable'
import { reject } from 'lodash'
import { Request, Response } from 'express'
import { UPLOAD_IMAGES_FILE_DIR_TEMP, UPLOAD_VIDEO_FILE_DIR } from '~/constants/dir'

export const initFolderUploads = () => {
  const uploadFolderPath = UPLOAD_IMAGES_FILE_DIR_TEMP
  if (!fs.existsSync(path.resolve(uploadFolderPath))) {
    fs.mkdirSync(uploadFolderPath, {
      recursive: true
    })
  }
}

export const handleUploadImage = (req: Request) => {
  return new Promise<File[]>((resolve, reject) => {
    const form = formidable({
      uploadDir: UPLOAD_IMAGES_FILE_DIR_TEMP,
      maxFiles: 4,
      keepExtensions: true,
      // maxFileSize: 400 * 1024, // 300kb
      maxTotalFileSize: 300 * 1024 * 4,
      filter: function ({ name, originalFilename, mimetype }) {
        // keep only images
        const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
        if (!valid) {
          form.emit('error' as any, new Error('File  is not valid') as any)
        }
        return valid
      }
    })
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        reject(new Error('File is not empty'))
      }
      resolve(files.image as File[])
    })
  })
}
export const handleUploadVideo = (req: Request) => {
  return new Promise<File[]>((resolve, reject) => {
    const form = formidable({
      uploadDir: UPLOAD_VIDEO_FILE_DIR,
      maxFiles: 1,
      // keepExtensions: true,
      // maxFileSize: 300 * 1024, // 300kb
      // maxTotalFileSize: 300 * 1024 * 4,
      filter: function ({ name, originalFilename, mimetype }) {
        const valid =
          (name === 'video' && Boolean(mimetype?.includes('mp4'))) || Boolean(mimetype?.includes('quicktime'))
        if (!valid) {
          form.emit('error' as any, new Error('File  is not valid') as any)
        }
        return true
      }
    })
    form.parse(req, (err, fields, files) => {
      console.log(1, files.video)
      if (err) {
        reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.video)) {
        reject(new Error('File is not empty'))
      }
      const videos = files.video as File[]
      if (videos?.length > 0) {
        videos.forEach((video) => {
          const ext = getExtentExt(video.originalFilename as string)
          fs.renameSync(video.filepath, video.filepath + '.' + ext)
          video.newFilename = video.newFilename + '.' + ext
        })
      }

      resolve(files.video as File[])
    })
  })
}

export const getNameFormFullName = (fullname: string) => {
  const nameArr = fullname.split('.')
  nameArr.pop()
  console.log("nameArr.join('')", nameArr.join(''))

  return nameArr.join('')
}

export const getExtentExt = (fullname: string) => {
  const nameArr = fullname.split('.')
  const ext = nameArr[nameArr.length - 1]
  return ext
}
