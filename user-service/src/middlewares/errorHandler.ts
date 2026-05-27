import { type Request, type Response, type NextFunction } from 'express';

export class HttpError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorHandler = (
  err: Error | HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = (err as HttpError).statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[ERROR] ${statusCode}: ${message}`);

  res.status(statusCode).json({
    error: {
      type: err.name,
      title: message,
      status: statusCode,
    },
  });
};

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({
    error: {
      type: 'not_found',
      title: 'Route not found',
      status: 404,
    },
  });
};
