import jwt, { SignOptions } from 'jsonwebtoken'
import { TokenPayload } from '~/models/request/User.request'

export const signToken = ({
  payload,
  privateKey,
  options = {
    algorithm: 'HS256'
    // expiresIn: '1d'
  }
}: {
  payload: string | object | Buffer
  privateKey: string
  options?: SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, function (err, token) {
      if (err) {
        throw reject(err)
      }
      resolve(token as string)
    })
  })
}

export const verifyToken = ({ token, secretOnpulichKey }: { token: string; secretOnpulichKey: string }) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secretOnpulichKey, function (err, decoded) {
      if (err) {
        // throw reject(new ErrorWithStatus({ message: err.message, status: HTTPSTATUS.UNAUTHORIZED }))
        throw reject(err)
      }
      resolve(decoded as TokenPayload)
    })
  })
}
