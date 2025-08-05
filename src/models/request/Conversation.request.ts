import { ParamsDictionary } from 'express-serve-static-core'

export interface ConversatioReqParams extends ParamsDictionary {
  receiver_id: string
}
