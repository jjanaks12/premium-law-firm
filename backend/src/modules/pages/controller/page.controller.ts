import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/generated";
import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import {
  createPageSchema,
  updatePageSchema,
  upsertPageSeoSchema,
  upsertPageSchemaSchema,
} from "@app/validations";

// Shared include for full page detail
const pageInclude = {
  page_type: true,
  thumbnail: true,
  author: { omit: { password: true } },
  seo: true,
  schema: true,
  children: {
    where: { deleted_at: null },
    select: { id: true, locale: true, title: true, status: true, slug: true },
  },
} as const;

export const index = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { locale, status, page_type_id, parent_id } = req.query;
    const filter: any = { deleted_at: null };

    if (locale) filter.locale = locale as string;
    if (status) filter.status = status as string;
    if (page_type_id) filter.page_type_id = page_type_id as string;
    if (parent_id === "null") {
      filter.parent_id = null;
    } else if (parent_id) {
      filter.parent_id = parent_id as string;
    }

    const pages = await prisma.page.findMany({
      where: filter,
      orderBy: { created_at: "desc" },
      include: {
        page_type: true,
        thumbnail: true,
        seo: { select: { meta_title: true, meta_description: true } },
      },
    });

    res.json({ success: true, data: pages });
  } catch (error) {
    next(error);
  }
};

export const show = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const page = await prisma.page.findFirst({
      where: { id, deleted_at: null },
      include: pageInclude,
    });
    if (!page) throw createHttpError.NotFound("Page not found");
    res.json({ success: true, data: page });
  } catch (error) {
    next(error);
  }
};

export const translations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const page = await prisma.page.findFirst({ where: { id, deleted_at: null } });
    if (!page) throw createHttpError.NotFound("Page not found");

    const rootId = page.parent_id ?? page.id;
    const variants = await prisma.page.findMany({
      where: {
        deleted_at: null,
        OR: [{ id: rootId }, { parent_id: rootId }],
      },
      select: { id: true, locale: true, title: true, status: true, slug: true, created_at: true },
    });

    res.json({ success: true, data: variants });
  } catch (error) {
    next(error);
  }
};

export const store = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await createPageSchema.validate(req.body, { abortEarly: false });

    const existing = await prisma.page.findUnique({ where: { slug: data.slug } });
    if (existing && !existing.deleted_at) {
      throw createHttpError.BadRequest("A page with this slug already exists");
    }

    const page = await prisma.page.create({
      data: {
        slug: data.slug,
        title: data.title,
        content: data.content ?? "",
        detail: (data.detail as Prisma.InputJsonValue) ?? {},
        excerpt: data.excerpt ?? null,
        status: data.status ?? "draft",
        locale: data.locale ?? "en",
        parent_id: data.parent_id ?? null,
        page_type_id: data.page_type_id ?? null,
        thumbnail_id: data.thumbnail_id ?? null,
        author_id: req.auth_user?.id ?? null,
      },
      include: pageInclude,
    });

    res.status(201).json({ success: true, data: page });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const data = await updatePageSchema.validate(req.body, { abortEarly: false });

    const page = await prisma.page.findFirst({ where: { id, deleted_at: null } });
    if (!page) throw createHttpError.NotFound("Page not found");

    if (data.slug && data.slug !== page.slug) {
      const conflict = await prisma.page.findUnique({ where: { slug: data.slug } });
      if (conflict && conflict.id !== id && !conflict.deleted_at) {
        throw createHttpError.BadRequest("A page with this slug already exists");
      }
    }

    const updated = await prisma.page.update({
      where: { id },
      data: {
        ...(data.slug && { slug: data.slug }),
        ...(data.title && { title: data.title }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.detail !== undefined && { detail: data.detail as Prisma.InputJsonValue }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
        ...(data.locale && { locale: data.locale }),
        ...(data.parent_id !== undefined && { parent_id: data.parent_id }),
        ...(data.page_type_id !== undefined && { page_type_id: data.page_type_id }),
        ...(data.thumbnail_id !== undefined && { thumbnail_id: data.thumbnail_id }),
      },
      include: pageInclude,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const publish = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const page = await prisma.page.findFirst({ where: { id, deleted_at: null } });
    if (!page) throw createHttpError.NotFound("Page not found");

    const updated = await prisma.page.update({ where: { id }, data: { status: "published" } });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const unpublish = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const page = await prisma.page.findFirst({ where: { id, deleted_at: null } });
    if (!page) throw createHttpError.NotFound("Page not found");

    const updated = await prisma.page.update({ where: { id }, data: { status: "draft" } });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const upsertSeo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const data = await upsertPageSeoSchema.validate(req.body, { abortEarly: false });

    const page = await prisma.page.findFirst({ where: { id, deleted_at: null } });
    if (!page) throw createHttpError.NotFound("Page not found");

    const seoData = {
      meta_title: data.meta_title ?? null,
      meta_description: data.meta_description ?? null,
      meta_keywords: data.meta_keywords ?? null,
      og_title: data.og_title ?? null,
      og_description: data.og_description ?? null,
      og_image_id: data.og_image_id ?? null,
      canonical_url: data.canonical_url ?? null,
      robots: data.robots ?? null,
    };

    const seo = await prisma.pageSeo.upsert({
      where: { page_id: id },
      create: { page_id: id, ...seoData },
      update: seoData,
    });

    res.json({ success: true, data: seo });
  } catch (error) {
    next(error);
  }
};

export const upsertSchema = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const data = await upsertPageSchemaSchema.validate(req.body, { abortEarly: false });

    const page = await prisma.page.findFirst({ where: { id, deleted_at: null } });
    if (!page) throw createHttpError.NotFound("Page not found");

    const schemaData = {
      schema_type: data.schema_type ?? null,
      schema_data: data.schema_data != null
        ? (data.schema_data as Prisma.InputJsonValue)
        : Prisma.JsonNull,
    };

    const schema = await prisma.pageSchema.upsert({
      where: { page_id: id },
      create: { page_id: id, ...schemaData },
      update: schemaData,
    });

    res.json({ success: true, data: schema });
  } catch (error) {
    next(error);
  }
};

export const destroy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const page = await prisma.page.findFirst({ where: { id, deleted_at: null } });
    if (!page) throw createHttpError.NotFound("Page not found");

    await prisma.page.update({ where: { id }, data: { deleted_at: new Date() } });
    res.json({ success: true, message: "Page deleted successfully" });
  } catch (error) {
    next(error);
  }
};
