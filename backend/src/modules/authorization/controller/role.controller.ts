import prisma from "@/lib/prisma";
import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { roleSchema } from "packages/validations/src";


export const index = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const roles = await prisma.role.findMany({
      where: {
        deleted_at: null,
      },
      orderBy: {
        created_at: "desc",
      },
    });
    response.json({ success: true, data: roles });
  } catch (error) {
    next(error);
  }
};

export const show = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = request.params.id as string;
    const role = await prisma.role.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!role) {
      throw createHttpError.NotFound("Role not found");
    }

    response.json({ success: true, data: role });
  } catch (error) {
    next(error);
  }
};

export const store = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const validatedData = await roleSchema.validate(request.body, { abortEarly: false });

    // Check if name is unique
    const existing = await prisma.role.findUnique({
      where: { name: validatedData.name },
    });
    if (existing) {
      if (existing.deleted_at === null) {
        throw createHttpError.BadRequest("Role with this name already exists");
      } else {
        // If it was soft-deleted, restore and update it
        const restored = await prisma.role.update({
          where: { id: existing.id },
          data: {
            name: validatedData.name,
            description: validatedData.description,
            permissions: (validatedData.permissions || {}) as any,
            deleted_at: null,
          },
        });
        return response.status(201).json({ success: true, data: restored });
      }
    }

    const newRole = await prisma.role.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        permissions: (validatedData.permissions || {}) as any,
      },
    });

    response.status(201).json({ success: true, data: newRole });
  } catch (error) {
    next(error);
  }
};

export const update = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = request.params.id as string;
    const validatedData = await roleSchema.validate(request.body, { abortEarly: false });

    const role = await prisma.role.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });
    if (!role) {
      throw createHttpError.NotFound("Role not found");
    }

    // Check if name is unique to another role
    if (validatedData.name !== role.name) {
      const existing = await prisma.role.findUnique({
        where: { name: validatedData.name },
      });
      if (existing && existing.id !== id && existing.deleted_at === null) {
        throw createHttpError.BadRequest("Role with this name already exists");
      }
    }

    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        permissions: (validatedData.permissions || {}) as any,
      },
    });

    response.json({ success: true, data: updatedRole });
  } catch (error) {
    next(error);
  }
};

export const destroy = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = request.params.id as string;
    const role = await prisma.role.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });
    if (!role) {
      throw createHttpError.NotFound("Role not found");
    }

    // Soft delete
    await prisma.role.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });

    response.json({ success: true, message: "Role deleted successfully" });
  } catch (error) {
    next(error);
  }
};