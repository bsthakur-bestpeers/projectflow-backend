import { Request, Response, NextFunction } from "express";
import { memberService } from "../services/member.service";

export const memberController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const members = await memberService.getMembers(
        parseInt(req.params.projectId), req.user!.userId
      );
      res.json({ success: true, data: members });
    } catch (error) { next(error); }
  },

  async add(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await memberService.addMember(
        parseInt(req.params.projectId), req.user!.userId, req.body.email
      );
      res.status(201).json({ success: true, data: member });
    } catch (error) { next(error); }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await memberService.removeMember(
        parseInt(req.params.projectId), req.user!.userId, parseInt(req.params.userId)
      );
      res.json({ success: true, message: "Member removed successfully." });
    } catch (error) { next(error); }
  },
};
