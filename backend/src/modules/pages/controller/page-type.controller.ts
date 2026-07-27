import prisma from "@/lib/prisma";
import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { createPageTypeSchema, updatePageTypeSchema } from "@app/validations";

export const index = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pageTypes = await prisma.pageType.findMany({
      where: { deleted_at: null },
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: pageTypes });
  } catch (error) {
    next(error);
  }
};

export const store = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await createPageTypeSchema.validate(req.body, { abortEarly: false });

    const existing = await prisma.pageType.findUnique({ where: { slug: data.slug } });
    if (existing && !existing.deleted_at) {
      throw createHttpError.BadRequest("A page type with this slug already exists");
    }

    if (existing && existing.deleted_at) {
      const restored = await prisma.pageType.update({
        where: { id: existing.id },
        data: { ...data, deleted_at: null },
      });
      return res.status(201).json({ success: true, data: restored });
    }

    const pageType = await prisma.pageType.create({ data });
    res.status(201).json({ success: true, data: pageType });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const data = await updatePageTypeSchema.validate(req.body, { abortEarly: false });

    const pageType = await prisma.pageType.findFirst({ where: { id, deleted_at: null } });
    if (!pageType) throw createHttpError.NotFound("Page type not found");

    // Check slug uniqueness against other records
    if (data.slug !== pageType.slug) {
      const conflict = await prisma.pageType.findUnique({ where: { slug: data.slug } });
      if (conflict && conflict.id !== id && !conflict.deleted_at) {
        throw createHttpError.BadRequest("A page type with this slug already exists");
      }
    }

    const updated = await prisma.pageType.update({ where: { id }, data });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const destroy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const pageType = await prisma.pageType.findFirst({ where: { id, deleted_at: null } });
    if (!pageType) throw createHttpError.NotFound("Page type not found");

    await prisma.pageType.update({ where: { id }, data: { deleted_at: new Date() } });
    res.json({ success: true, message: "Page type deleted successfully" });
  } catch (error) {
    next(error);
  }
};
