import { Request, Response } from "express";
import { Op } from "sequelize";
import Zone from "../db/models/Zones";
import Greenhouse from "../db/models/Greenhouses";
import ResponseUtil from "../utils/Response";
import CustomError from "../utils/Error";
import Enum from "../config/Enum";

function isAdmin(req: Request) {
  return req.user?.roles?.includes("Admin") || req.user?.permissions?.includes?.("greenhouse_view_all");
}

async function mustOwnGreenhouseOrAdmin(req: Request, greenhouseId: number) {
  if (isAdmin(req)) return;
  const gh = await Greenhouse.findByPk(greenhouseId);
  if (!gh) throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", `No greenhouse with id ${greenhouseId}`);
  if (gh.user_id !== req.user!.id) {
    throw new CustomError(Enum.HTTP_CODES.FORBIDDEN, "Forbidden", "You do not own this greenhouse");
  }
}

const zoneController = {
  async list(req: Request, res: Response) {
    try {
      const page  = Math.max(1, parseInt(String(req.query.page ?? "1")));
      const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? "10"))));
      const offset = (page - 1) * limit;
      const q = String(req.query.q ?? "").trim();
      const greenhouseId = req.query.greenhouse_id ? Number(req.query.greenhouse_id) : undefined;

      const where: any = {};
      if (q) where.name = { [Op.iLike]: `%${q}%` };
      if (greenhouseId) {
        await mustOwnGreenhouseOrAdmin(req, greenhouseId);
        where.greenhouse_id = greenhouseId;
      } else if (!isAdmin(req)) {
        // Admin değilse, sadece kendi seralarına ait zonelar
        // Basit yol: join yoksa, listelemek için greenhouse_id paramı zorunlu kılmayı tercih edebilirsin.
        throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Provide greenhouse_id");
      }

      const { rows, count } = await Zone.findAndCountAll({ where, limit, offset, order: [["id", "DESC"]] });
      return res.json(ResponseUtil.successResponse({
        items: rows, page, limit, total: count, totalPages: Math.ceil(count / limit),
      }));
    } catch (err) {
      const e = ResponseUtil.errorResponse(err);
      return res.status(e.code).json(e);
    }
  },

  async detail(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Invalid id");

      const zone = await Zone.findByPk(id);
      if (!zone) throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", `No zone ${id}`);

      await mustOwnGreenhouseOrAdmin(req, (zone as any).greenhouse_id);
      return res.json(ResponseUtil.successResponse(zone));
    } catch (err) {
      const e = ResponseUtil.errorResponse(err);
      return res.status(e.code).json(e);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { name, greenhouse_id } = req.body || {};
      if (!name || !String(name).trim() || !Number.isFinite(Number(greenhouse_id))) {
        throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "`name` and `greenhouse_id` are required");
      }

      await mustOwnGreenhouseOrAdmin(req, Number(greenhouse_id));
      const zone = await Zone.create({ name: String(name).trim(), greenhouse_id: Number(greenhouse_id) });
      return res.status(Enum.HTTP_CODES.CREATED).json(ResponseUtil.successResponse(zone));
    } catch (err) {
      const e = ResponseUtil.errorResponse(err);
      return res.status(e.code).json(e);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Invalid id");

      const zone = await Zone.findByPk(id);
      if (!zone) throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", `No zone ${id}`);

      await mustOwnGreenhouseOrAdmin(req, (zone as any).greenhouse_id);

      const updates: any = {};
      if (typeof req.body?.name === "string" && req.body.name.trim()) updates.name = req.body.name.trim();
      if (Object.keys(updates).length === 0) return res.json(ResponseUtil.successResponse("Nothing to update"));

      await zone.update(updates);
      return res.json(ResponseUtil.successResponse("Zone updated"));
    } catch (err) {
      const e = ResponseUtil.errorResponse(err);
      return res.status(e.code).json(e);
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Invalid id");

      const zone = await Zone.findByPk(id);
      if (!zone) throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", `No zone ${id}`);

      await mustOwnGreenhouseOrAdmin(req, (zone as any).greenhouse_id);
      await zone.destroy();
      return res.json(ResponseUtil.successResponse(`Zone ${id} deleted`));
    } catch (err) {
      const e = ResponseUtil.errorResponse(err);
      return res.status(e.code).json(e);
    }
  },
};

export default zoneController;