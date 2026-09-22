import { Request, Response, NextFunction } from "express";
export declare const adminController: {
    listUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
    approveUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    rejectUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    changeRole(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=admin.controller.d.ts.map