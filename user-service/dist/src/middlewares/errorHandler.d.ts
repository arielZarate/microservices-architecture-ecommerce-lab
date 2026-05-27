import { type Request, type Response, type NextFunction } from 'express';
export declare class HttpError extends Error {
    statusCode: number;
    constructor(message: string, statusCode?: number);
}
export declare const errorHandler: (err: Error | HttpError, _req: Request, res: Response, _next: NextFunction) => void;
export declare const notFoundHandler: (_req: Request, res: Response) => void;
//# sourceMappingURL=errorHandler.d.ts.map