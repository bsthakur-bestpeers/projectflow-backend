import { Request, Response, NextFunction } from "express";
export interface JwtPayload {
    userId: number;
    email: string;
    role?: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
export declare const authenticate: (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map