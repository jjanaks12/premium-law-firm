import prisma from "@/lib/prisma";
import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

// Get all case natures
export const index = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search } = req.query;
    const filter: any = {};

    if (search) {
      const searchStr = search as string;
      filter.OR = [
        { name: { contains: searchStr, mode: "insensitive" } },
        { nepaliName: { contains: searchStr, mode: "insensitive" } },
      ];
    }

    const caseNatures = await prisma.caseNature.findMany({
      where: filter,
      orderBy: { id: "desc" },
    });

    res.json({ data: caseNatures });
  } catch (error) {
    next(error);
  }
};

// Get a single case nature by ID
export const show = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const caseNature = await prisma.caseNature.findUnique({
      where: { id: id as string },
    });

    if (!caseNature) {
      throw createHttpError(404, "Case Nature not found");
    }

    res.json({ data: caseNature });
  } catch (error) {
    next(error);
  }
};

// Create a new case nature
export const store = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, nepaliName } = req.body;

    const existing = await prisma.caseNature.findUnique({
      where: { name },
    });

    if (existing) {
      throw createHttpError(409, "A case nature with this name already exists");
    }

    const newCaseNature = await prisma.caseNature.create({
      data: {
        name,
        nepaliName,
      },
    });

    res.status(201).json({ message: "Case Nature created successfully", data: newCaseNature });
  } catch (error) {
    next(error);
  }
};

// Update an existing case nature
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, nepaliName } = req.body;

    const caseNature = await prisma.caseNature.findUnique({
      where: { id: id as string },
    });

    if (!caseNature) {
      throw createHttpError(404, "Case Nature not found");
    }

    if (name && name !== caseNature.name) {
      const existing = await prisma.caseNature.findUnique({
        where: { name },
      });

      if (existing) {
        throw createHttpError(409, "A case nature with this name already exists");
      }
    }

    const updatedCaseNature = await prisma.caseNature.update({
      where: { id: id as string },
      data: {
        name,
        nepaliName,
      },
    });

    res.json({ message: "Case Nature updated successfully", data: updatedCaseNature });
  } catch (error) {
    next(error);
  }
};

// Delete a case nature
export const destroy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const caseNature = await prisma.caseNature.findUnique({
      where: { id: id as string },
    });

    if (!caseNature) {
      throw createHttpError(404, "Case Nature not found");
    }

    await prisma.caseNature.delete({
      where: { id: id as string },
    });

    res.json({ message: "Case Nature deleted successfully" });
  } catch (error) {
    next(error);
  }
};
