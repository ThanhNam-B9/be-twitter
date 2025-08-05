import { Pagination } from './Tweet.request'

export interface SearchType extends Pagination {
  content: string
  media_type: string
}
