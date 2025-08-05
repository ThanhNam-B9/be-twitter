export enum MediaType {
  Image,
  Video
}

export interface Media {
  url: string
  type: MediaType // video, image
}
export enum MediaTypeReq {
  Image = 'image',
  Video = 'video'
}
