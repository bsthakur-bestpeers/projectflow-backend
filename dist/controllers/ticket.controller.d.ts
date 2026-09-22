import { Request, Response, NextFunction } from "express";
export declare const ticketController: {
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    listByProject(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    remove(req: Request, res: Response, next: NextFunction): Promise<void>;
    move(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDashboard(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=ticket.controller.d.ts.map