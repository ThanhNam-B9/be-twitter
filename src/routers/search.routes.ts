import { Router } from 'express'
import { searchAdvanceController } from '~/controllers/searchs.controller'
import { searchTweetsValidtor } from '~/middlewares/search.middleware'
import { paginationValidator } from '~/middlewares/tweets.middleware'
import { accessTokenValidater, verifyAccountValidater } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handles'

const searchTweetsRouter = Router()
searchTweetsRouter.get(
  '/',
  accessTokenValidater,
  verifyAccountValidater,
  paginationValidator,
  searchTweetsValidtor,
  wrapRequestHandler(searchAdvanceController)
)
export default searchTweetsRouter
