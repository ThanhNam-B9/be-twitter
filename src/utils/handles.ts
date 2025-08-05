import { NextFunction, Request, Response, RequestHandler } from 'express'

export const wrapRequestHandler = <P>(func: RequestHandler<P, any, any, any>) => {
  // return (res: any, req: any, next: any) => {
  //   func(req, res, next).catch(next)
  // }
  // Lưu ý không return về 1 cái throw
  return async (req: Request<P>, res: Response, next: NextFunction) => {
    // Promise.resolve(func(req, res, next)).catch(next) // chỉ dùng cho fuc nhận vô phải có async
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
