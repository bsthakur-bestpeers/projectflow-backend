import { Request, Response, NextFunction } from "express";
export declare const sprintController: {
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    listByProject(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    remove(req: Request, res: Response, next: NextFunction): Promise<void>;
    start(req: Request, res: Response, next: NextFunction): Promise<void>;
    complete(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=sprint.controller.d.ts.map