import prisma from "@/lib/prisma";
import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import fs from "fs/promises";
import path from "path";
import { formatResourceUrl } from "@/lib/file";

export const index = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, type, page, limit } = req.query;
    const filter: any = { deleted_at: null };

    if (search) {
      filter.name = { contains: search as string, mode: "insensitive" };
    }

    if (type) {
      filter.type = { contains: type as string, mode: "insensitive" };
    }

    const pageNum = page ? parseInt(page as string) : undefined;
    const limitNum = limit ? parseInt(limit as string) : undefined;

    let resources;
    let total = 0;

    if (pageNum && limitNum) {
      const skip = (pageNum - 1) * limitNum;
      [resources, total] = await prisma.$transaction([
        prisma.resource.findMany({
          where: filter,
          orderBy: { created_at: "desc" },
          skip,
          take: limitNum,
        }),
        prisma.resource.count({ where: filter }),
      ]);
    } else {
      resources = await prisma.resource.findMany({
        where: filter,
        orderBy: { created_at: "desc" },
      });
      total = resources.length;
    }

    const formattedResources = resources.map((r) => formatResourceUrl(req, r));
    res.status(200).json({
      success: true,
      data: formattedResources,
      meta: pageNum && limitNum ? {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      } : undefined
    });
  } catch (error) {
    next(error);
  }
};

export const uploadResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next(createHttpError(400, "No file uploaded"));
    }

    const { name, description } = req.body;

    const url = `/uploads/${req.file.filename}`;
    const resource = await prisma.resource.create({
      data: {
        url,
        type: req.file.mimetype,
        name: name || req.file.originalname,
        description: description || null,
        size: req.file.size,
      },
    });

    res.status(201).json({ success: true, data: formatResourceUrl(req, resource) });
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

    res.status(200).json({ success: true, data: formatResourceUrl(req, resource) });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { name, description } = req.body;

    const existingResource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!existingResource) {
      return next(createHttpError(404, "Resource not found"));
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    if (req.file) {
      // delete old file
      const relativePath = existingResource.url.replace(/^\//, "");
      const absolutePath = path.join(process.cwd(), relativePath);
      try {
        await fs.unlink(absolutePath);
      } catch (fsErr) {
        console.warn(`Could not delete old file from disk: ${absolutePath}`, fsErr);
      }

      updateData.url = `/uploads/${req.file.filename}`;
      updateData.type = req.file.mimetype;
      updateData.size = req.file.size;
      if (!name) updateData.name = req.file.originalname;
    }

    const resource = await prisma.resource.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({ success: true, data: formatResourceUrl(req, resource) });
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
