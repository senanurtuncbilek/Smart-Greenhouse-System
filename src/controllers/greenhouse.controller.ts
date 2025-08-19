import { Request, Response } from "express";
import { Op } from "sequelize";
import Greenhouse from "../db/models/Greenhouses";
import ResponseUtil from "../utils/Response";
import CustomError from "../utils/Error";
import Enum from "../config/Enum";

function isAdmin(req: Request) {
  return req.user?.roles?.includes("Admin") 
      || req.user?.permissions?.includes?.("greenhouse_view_all"); // opsiyonel izin
}

function mustBeOwnerOrAdmin(req: Request, gh: Greenhouse) {
  if (isAdmin(req)) return;
  if (gh.user_id !== req.user!.id) {
    throw new CustomError(
      Enum.HTTP_CODES.FORBIDDEN,
      "Forbidden",
      "You do not own this greenhouse"
    );
  }
}

const greenhouseController = {
  // greenhouse?q=&page=&limit=&sortBy=&order=
  async list(req: Request, res: Response) {
    try {
      const page  = Math.max(1, parseInt(String(req.query.page ?? "1")));
      const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? "10"))));
      const offset = (page - 1) * limit;
      const q = String(req.query.q ?? "").trim();
      const sortBy = (req.query.sortBy as string) || "created_at";
      const order  = ((req.query.order as string) || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";

      const where: any = {};
      if (!isAdmin(req)) where.user_id = req.user!.id;
      if (q) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${q}%` } },
          { location: { [Op.iLike]: `%${q}%` } },
        ];
      }

      const { rows, count } = await Greenhouse.findAndCountAll({
        where,
        order: [[sortBy, order]],
        limit,
        offset,
      });

      return res.json(
        ResponseUtil.successResponse({
          items: rows,
          page, limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        })
      );
    } catch (err) {
      const e = ResponseUtil.errorResponse(err);
      return res.status(e.code).json(e);
    }
  },

  async detail(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Invalid id");
      }
      const gh = await Greenhouse.findByPk(id);
      if (!gh) {
        throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", `No greenhouse with id ${id}`);
      }
      mustBeOwnerOrAdmin(req, gh);
      return res.json(ResponseUtil.successResponse(gh));
    } catch (err) {
      const e = ResponseUtil.errorResponse(err);
      return res.status(e.code).json(e);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { name, location } = req.body || {};
      if (!name || !String(name).trim() || !location || !String(location).trim()) {
        throw new CustomError(
          Enum.HTTP_CODES.BAD_REQUEST,
          "Validation Error",
          "`name` and `location` are required"
        );
      }

      const gh = await Greenhouse.create({
        name: String(name).trim(),
        location: String(location).trim(),
        user_id: req.user!.id,
      });

      return res.status(Enum.HTTP_CODES.CREATED)
        .json(ResponseUtil.successResponse(gh));
    } catch (err: any) {
      if (err?.name === "SequelizeUniqueConstraintError") {
        const e = new CustomError(
          Enum.HTTP_CODES.CONFLICT,
          "Duplicate",
          "Greenhouse name already exists"
        );
        const r = ResponseUtil.errorResponse(e);
        return res.status(r.code).json(r);
      }
      const e = ResponseUtil.errorResponse(err);
      return res.status(e.code).json(e);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Invalid id");
      }
      const gh = await Greenhouse.findByPk(id);
      if (!gh) {
        throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", `No greenhouse with id ${id}`);
      }
      mustBeOwnerOrAdmin(req, gh);

      const updates: any = {};
      if (typeof req.body?.name === "string" && req.body.name.trim()) {
        updates.name = req.body.name.trim();
      }
      if (typeof req.body?.location === "string" && req.body.location.trim()) {
        updates.location = req.body.location.trim();
      }

      if (Object.keys(updates).length === 0) {
        return res.json(ResponseUtil.successResponse("Nothing to update"));
      }

      await gh.update(updates);
      return res.json(ResponseUtil.successResponse("Greenhouse updated"));
    } catch (err: any) {
      if (err?.name === "SequelizeUniqueConstraintError") {
        const e = new CustomError(Enum.HTTP_CODES.CONFLICT, "Duplicate", "Greenhouse name already exists");
        const r = ResponseUtil.errorResponse(e);
        return res.status(r.code).json(r);
      }
      const e = ResponseUtil.errorResponse(err);
      return res.status(e.code).json(e);
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Invalid id");
      }
      const gh = await Greenhouse.findByPk(id);
      if (!gh) {
        throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", `No greenhouse with id ${id}`);
      }
      mustBeOwnerOrAdmin(req, gh);

      await gh.destroy();
      return res.json(ResponseUtil.successResponse(`Greenhouse ${id} deleted`));
    } catch (err) {
      const e = ResponseUtil.errorResponse(err);
      return res.status(e.code).json(e);
    }
  },
};

export default greenhouseController;
