import { Request, Response } from 'express'
import path from 'path'
import { UPLOAD_IMAGES_FILE_DIR, UPLOAD_IMAGES_FILE_DIR_TEMP, UPLOAD_VIDEO_FILE_DIR } from '~/constants/dir'
import HTTPSTATUS from '~/constants/httpStatus'
import fs from 'fs'

export const staticImageController = (req: Request, res: Response) => {
  const nameParams = req.params.name
  res.sendFile(path.resolve(UPLOAD_IMAGES_FILE_DIR, nameParams), (error) => {
    if (error) {
      res.status((error as any).status).send('Not Found !')
    }
  })
}
export const staticVideoStreamController = async (req: Request, res: Response) => {
  const range = req.headers.range
  if (!range) {
    return res.status(HTTPSTATUS.BAD_REQUEST).send('Requires Range header')
  }
  const nameParams = req.params.name
  const videoPath = path.resolve(UPLOAD_VIDEO_FILE_DIR, nameParams)
  // 1MB = 10^6 bytes (Tính theo hệ 10 , đây là thứ chúng ta hay thấy trên IU )
  // Còn nếu thích theo hệ nhi phân thì 1MB = 2^ 20 bytes (1024*1024)

  //Dung lượng video
  const videoSize = fs.statSync(videoPath).size
  //DUng lượng của mỗi đoạn stream
  const chunkSize = 10 ** 6 //1MB
  //Lấy giá trị bytes bắt đầu từ header Range (vd:bytes=101215-)
  const start = Number(range.replace(/\D/g, ''))
  // Lấy giá trị bytes KT , vượt quá dung lượng video thì lấy giá trị videoSize
  const end = Math.min(start + chunkSize, videoSize - 1)
  // Công thức của Content-Length : end - start + 1
  //Dung lượng thực tế cho mỗi đoạn video stream
  //thường sẽ là chunksize hoặc đoạn cuối cùng
  const contentLength = end - start
  const mime = (await import('mime')).default
  const contentType = mime.getType(videoPath) || 'video/*'
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }
  res.writeHead(HTTPSTATUS.PARTIAL_CONTENT, headers)
  const videoStream = fs.createReadStream(videoPath, { start, end })
  videoStream.pipe(res)
}
