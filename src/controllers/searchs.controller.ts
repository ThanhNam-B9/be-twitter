import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { MediaTypeReq } from '~/models/Other'
import { SearchType } from '~/models/request/Search.request'
import searchServices from '~/services/search.services'
export const searchAdvanceController = async (req: Request<ParamsDictionary, any, any, SearchType>, res: Response) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const content = req.query.content
  const media_type = req.query.media_type as MediaTypeReq
  const user_id = req.decoded_authorization?.user_id as string
  const query = { limit, page, content, user_id, media_type }
  const result = await searchServices.search(query)
  return res.json({
    message: 'Search is successfully !',
    result
  })
}
