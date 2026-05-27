import { Request, Response, NextFunction } from "express";
declare const middleware_security: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export default middleware_security;
//# sourceMappingURL=token.interceptor.d.ts.map