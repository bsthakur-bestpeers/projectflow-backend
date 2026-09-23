import { Request, Response, NextFunction } from "express";
import { ticketService } from "../services/ticket.service";
import { DEFAULT_PAGE, DEFAULT_LIMIT } from "../constants/app.constants";

export const ticketController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = parseInt(req.params.projectId);
      const { title, description, status, priority, estimation, sprintId, assigneeId, authorId } = req.body;
      const ticket = await ticketService.createTicket(projectId, req.user!.userId, {
        title,
        description,
        status,
        priority,
        estimation,
        sprint_id: sprintId ?? null,
        assignee_id: assigneeId ?? null,
        author_id: authorId ? parseInt(authorId) : req.user!.userId,
      });
      res.status(201).json({ success: true, data: ticket });
    } catch (error) { next(error); }
  },

  async listByProject(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = parseInt(req.params.projectId);
      const { status, priority, assigneeId, sprintId, search, page, limit } = req.query;
      const filter = {
        status: status as string | undefined,
        priority: priority as string | undefined,
        assigneeId: assigneeId ? parseInt(assigneeId as string) : undefined,
        sprintId: sprintId === "null" ? null : sprintId ? parseInt(sprintId as string) : undefined,
        search: search as string | undefined,
        page: page ? parseInt(page as string) : DEFAULT_PAGE,
        limit: limit ? parseInt(limit as string) : DEFAULT_LIMIT,
      };
      const result = await ticketService.getTickets(projectId, req.user!.userId, filter);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[listByProject Error]:", error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to load tickets",
      });
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await ticketService.getTicketById(
        parseInt(req.params.ticketId), req.user!.userId
      );
      res.json({ success: true, data: ticket });
    } catch (error) { next(error); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, description, status, priority, estimation, assigneeId, sprintId, authorId } = req.body;
      const ticket = await ticketService.updateTicket(
        parseInt(req.params.ticketId), req.user!.userId,
        {
          title,
          description,
          status,
          priority,
          estimation,
          assignee_id: assigneeId,
          sprint_id: sprintId,
          author_id: authorId ? parseInt(authorId) : undefined,
        }
      );
      res.json({ success: true, data: ticket });
    } catch (error) { next(error); }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await ticketService.deleteTicket(parseInt(req.params.ticketId), req.user!.userId);
      res.json({ success: true, message: "Ticket deleted successfully." });
    } catch (error) { next(error); }
  },

  async move(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, position, sprintId } = req.body;
      const ticket = await ticketService.moveTicket(
        parseInt(req.params.ticketId), req.user!.userId,
        { status, position, sprintId }
      );
      res.json({ success: true, data: ticket });
    } catch (error) { next(error); }
  },

  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ticketService.getDashboardData(req.user!.userId);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  },
};
