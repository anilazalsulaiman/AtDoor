 
import { Response } from 'express'

export const sendSuccess = (
  res: Response,
  data: any,
  message: string = 'Success',
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

export const sendError = (
  res: Response,
  message: string = 'Something went wrong',
  statusCode: number = 400
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
  })
}