import prisma from "@/lib/prisma";
import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import fs from "fs/promises";
import path from "path";

export const index = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, type } = req.query;
    const filter: any = { deleted_at: null };

    if (search) {
      filter.name = { contains: search as string, mode: "insensitive" };
    }

    if (type) {
      filter.type = { contains: type as string, mode: "insensitive" };
    }

    const resources = await prisma.resource.findMany({
      where: filter,
      orderBy: { created_at: "desc" },
    });

    res.status(200).json({ success: true, data: resources });
  } catch (error) {
    next(error);
  }
};

export const uploadResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next(createHttpError(400, "No file uploaded"));
    }

    const url = `/uploads/${req.file.filename}`;
    const resource = await prisma.resource.create({
      data: {
        url,
        type: req.file.mimetype,
        name: req.file.originalname,
        size: req.file.size,
      },
    });

    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    next(error);
  }
};

export const show = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const resource = await prisma.resource.findFirst({
      where: { id, deleted_at: null },
    });

    if (!resource) {
      return next(createHttpError(404, "Resource not found"));
    }

    res.status(200).json({ success: true, data: resource });
  } catch (error) {
    next(error);
  }
};

export const destroy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const resource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      return next(createHttpError(404, "Resource not found"));
    }

    // Delete local file from disk
    const relativePath = resource.url.replace(/^\//, "");
    const absolutePath = path.join(process.cwd(), relativePath);

    try {
      await fs.unlink(absolutePath);
    } catch (fsErr) {
      console.warn(`Could not delete file from disk: ${absolutePath}`, fsErr);
    }

    await prisma.resource.delete({
      where: { id },
    });

    res.status(200).json({ success: true, message: "Resource deleted successfully" });
  } catch (error) {
    next(error);
  }
};
