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
      const projectId = parseInt(req.params.projectId);
      const { email, emails } = req.body;

      if (emails && Array.isArray(emails)) {
        const result = await memberService.addMembers(
          projectId, req.user!.userId, emails
        );
        return res.status(201).json({
          success: true,
          data: result.added,
          errors: result.errors,
          message: `${result.added.length} member(s) added successfully.`,
        });
      }

      const member = await memberService.addMember(
        projectId, req.user!.userId, email
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
