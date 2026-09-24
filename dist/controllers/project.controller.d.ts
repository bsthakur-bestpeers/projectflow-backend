import { Request, Response, NextFunction } from "express";
export declare const projectController: {
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    list(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    remove(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSummary(req: Request, res: Response, next: NextFunction): Promise<void>;
    downloadSampleTemplate(req: Request, res: Response, next: NextFunction): Promise<void>;
    exportXlsx(req: Request, res: Response, next: NextFunction): Promise<void>;
    importXlsx(req: Request, res: Response, next: NextFunction): Promise<void>;
    importIntoProject(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=project.controller.d.ts.map