import { Request, Response } from "express";
import { Op } from "sequelize";
import Sensor, { SensorType, SensorStatus } from "../db/models/Sensors";
import SensorReading from "../db/models/SensorReadings";
import Zone from "../db/models/Zones";
import Greenhouse from "../db/models/Greenhouses";
import ResponseUtil from "../utils/Response";
import CustomError from "../utils/Error";
import Enum from "../config/Enum";

function isAdmin(req: Request) {
  return req.user?.roles?.includes("Admin") || req.user?.permissions?.includes?.("greenhouse_view_all");
}

async function mustOwnZoneOrAdmin(req: Request, zoneId: number) {
  if (isAdmin(req)) return;
  const zone = await Zone.findByPk(zoneId);
  if (!zone) throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", `No zone ${zoneId}`);
  const gh = await Greenhouse.findByPk((zone as any).greenhouse_id);
  if (!gh) throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", `No greenhouse ${ (zone as any).greenhouse_id }`);
  if (gh.user_id !== req.user!.id) {
    throw new CustomError(Enum.HTTP_CODES.FORBIDDEN, "Forbidden", "You do not own this zone/greenhouse");
  }
}

const TYPE_TO_DEFAULT_UNIT: Record<SensorType, string> = {
  [SensorType.TEMPERATURE]: "C",
  [SensorType.HUMIDITY]: "%",
  [SensorType.SOIL_MOISTURE]: "%",
  [SensorType.LIGHT_LEVEL]: "lux",
  [SensorType.PH]: "ph",
  [SensorType.CO2]: "ppm",
};

const sensorController = {
  async list(req: Request, res: Response) {
    try {
      const page  = Math.max(1, parseInt(String(req.query.page ?? "1")));
      const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? "10"))));
      const offset = (page - 1) * limit;

      const zoneId = req.query.zone_id ? Number(req.query.zone_id) : undefined;
      const type = req.query.type ? String(req.query.type) as SensorType : undefined;
      const status = req.query.status ? String(req.query.status) as SensorStatus : undefined;

      const where: any = {};
      if (zoneId) {
        await mustOwnZoneOrAdmin(req, zoneId);
        where.zone_id = zoneId;
      } else if (!isAdmin(req)) {
        throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Provide zone_id");
      }
      if (type) where.type = type;
      if (status) where.status = status;

      const { rows, count } = await Sensor.findAndCountAll({ where, limit, offset, order: [["id", "DESC"]] });
      return res.json(ResponseUtil.successResponse({ items: rows, page, limit, total: count, totalPages: Math.ceil(count/limit) }));
    } catch (err) {
      const e = ResponseUtil.errorResponse(err);
      return res.status(e.code).json(e);
    }
  },

  async detail(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Invalid id");
      const sensor = await Sensor.findByPk(id);
      if (!sensor) throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", `No sensor ${id}`);
      await mustOwnZoneOrAdmin(req, (sensor as any).zone_id);
      return res.json(ResponseUtil.successResponse(sensor));
    } catch (err) {
      const e = ResponseUtil.errorResponse(err);
      return res.status(e.code).json(e);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { name, type, zone_id, location, status } = req.body || {};
      if (!name || !String(name).trim() || !type || !zone_id || !location) {
        throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "`name`, `type`, `zone_id`, `location` are required");
      }
      if (!Object.values(SensorType).includes(type)) {
        throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", `Invalid sensor type: ${type}`);
      }
      await mustOwnZoneOrAdmin(req, Number(zone_id));

      const sensor = await Sensor.create({
        name: String(name).trim(),
        type,
        zone_id: Number(zone_id),
        status: status && Object.values(SensorStatus).includes(status) ? status : SensorStatus.ACTIVE,
        location: String(location).trim(),
      });

      return res.status(Enum.HTTP_CODES.CREATED).json(ResponseUtil.successResponse(sensor));
    } catch (err) {
      const e = ResponseUtil.errorResponse(err);
      return res.status(e.code).json(e);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Invalid id");
      const sensor = await Sensor.findByPk(id);
      if (!sensor) throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", `No sensor ${id}`);

      await mustOwnZoneOrAdmin(req, (sensor as any).zone_id);

      const updates: any = {};
      if (typeof req.body?.name === "string" && req.body.name.trim()) updates.name = req.body.name.trim();
      if (typeof req.body?.location === "string" && req.body.location.trim()) updates.location = req.body.location.trim();
      if (req.body?.status && Object.values(SensorStatus).includes(req.body.status)) updates.status = req.body.status;

      if (Object.keys(updates).length === 0) return res.json(ResponseUtil.successResponse("Nothing to update"));
      await sensor.update(updates);
      return res.json(ResponseUtil.successResponse("Sensor updated"));
    } catch (err) {
      const e = ResponseUtil.errorResponse(err);
      return res.status(e.code).json(e);
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Invalid id");
      const sensor = await Sensor.findByPk(id);
      if (!sensor) throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", `No sensor ${id}`);
      await mustOwnZoneOrAdmin(req, (sensor as any).zone_id);
      await sensor.destroy();
      return res.json(ResponseUtil.successResponse(`Sensor ${id} deleted`));
    } catch (err) {
      const e = ResponseUtil.errorResponse(err);
      return res.status(e.code).json(e);
    }
  },

  // Readings
  async addReading(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Invalid sensor id");
      const sensor = await Sensor.findByPk(id);
      if (!sensor) throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", `No sensor ${id}`);
      await mustOwnZoneOrAdmin(req, (sensor as any).zone_id);

      const { value, unit, timestamp } = req.body || {};
      if (value === undefined || value === null) {
        throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "`value` is required");
      }
      const defaultUnit = TYPE_TO_DEFAULT_UNIT[(sensor as any).type as SensorType];
      const finalUnit = unit || defaultUnit;

      const reading = await SensorReading.create({
        sensor_id: id,
        value: Number(value),
        unit: String(finalUnit),
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        is_anomaly: false
      });

      return res.status(Enum.HTTP_CODES.CREATED).json(ResponseUtil.successResponse(reading));
    } catch (err) {
      const e = ResponseUtil.errorResponse(err);
      return res.status(e.code).json(e);
    }
  },

  async listReadings(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Invalid sensor id");
      const sensor = await Sensor.findByPk(id);
      if (!sensor) throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", `No sensor ${id}`);
      await mustOwnZoneOrAdmin(req, (sensor as any).zone_id);

      const from = req.query.from ? new Date(String(req.query.from)) : undefined;
      const to = req.query.to ? new Date(String(req.query.to)) : undefined;
      const limit = Math.min(1000, Math.max(1, parseInt(String(req.query.limit ?? "200"))));

      const where: any = { sensor_id: id };
      if (from) where.timestamp = { ...(where.timestamp || {}), [Op.gte]: from };
      if (to) where.timestamp = { ...(where.timestamp || {}), [Op.lte]: to };

      const rows = await SensorReading.findAll({ where, order: [["timestamp", "DESC"]], limit });
      return res.json(ResponseUtil.successResponse(rows));
    } catch (err) {
      const e = ResponseUtil.errorResponse(err);
      return res.status(e.code).json(e);
    }
  },
};

export default sensorController;