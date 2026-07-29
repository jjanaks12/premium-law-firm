import prisma from "@/lib/prisma";
import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

// Get all cases
export const index = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, natureId, status, partyName } = req.query;

    const filter: any = {};

    if (natureId) {
      filter.natureId = natureId as string;
    }

    if (status) {
      filter.status = status as string;
    }

    if (partyName) {
      filter.parties = {
        some: {
          partyName: { contains: partyName as string, mode: "insensitive" }
        }
      };
    }

    if (search) {
      const searchStr = search as string;
      filter.OR = [
        { caseNumber: { contains: searchStr, mode: "insensitive" } },
        { caseName: { contains: searchStr, mode: "insensitive" } },
      ];
    }

    const cases = await prisma.case.findMany({
      where: filter,
      include: {
        nature: true,
        parties: {
          include: {
            role: true,
          }
        },
        lawyers: {
          include: {
            user: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ data: cases });
  } catch (error) {
    next(error);
  }
};

// Get a single case by ID
export const show = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const caseData = await prisma.case.findUnique({
      where: { id: id as string },
      include: {
        nature: true,
        parties: {
          include: {
            role: true,
          }
        },
        lawyers: {
          include: {
            user: true,
          }
        },
        hearings: true,
        pleadings: {
          include: { pleader: true },
        },
        proceedings: {
          include: { courtLevel: true },
        },
        precedents: true,
        payments: true,
        counselings: {
          include: { counselor: true },
        },
        documents: true,
      },
    });

    if (!caseData) {
      throw createHttpError(404, "Case not found");
    }

    res.json({ data: caseData });
  } catch (error) {
    next(error);
  }
};

// Create a new case
export const store = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      caseNumber,
      caseName,
      natureId,
      registrationDate,
      registrationFee,
      sectionCourtRoom,
      facts,
      relatedLaws,
      referredThrough,
      noticeStatus,
      parties,
      lawyers,
      status
    } = req.body;

    // Check if case with same number exists
    const existingCase = await prisma.case.findUnique({
      where: { caseNumber },
    });

    if (existingCase) {
      throw createHttpError(409, "A case with this Case Number already exists");
    }

    const newCase = await prisma.case.create({
      data: {
        caseNumber,
        caseName,
        natureId,
        registrationDate: registrationDate ? new Date(registrationDate) : null,
        registrationFee,
        sectionCourtRoom,
        facts,
        relatedLaws,
        referredThrough,
        noticeStatus,
        status: status || "Draft",
        parties: parties && parties.length > 0 ? {
          create: parties.map((party: any) => ({
            partyName: party.partyName,
            roleId: party.roleId,
            fee: party.fee,
            contactInfo: party.contactInfo,
          }))
        } : undefined,
        lawyers: lawyers && lawyers.length > 0 ? {
          create: lawyers.map((lawyer: any) => ({
            userId: lawyer.userId,
            isLead: lawyer.isLead || false,
          }))
        } : undefined,
      },
      include: {
        nature: true,
        parties: true,
        lawyers: true,
      }
    });

    res.status(201).json({ message: "Case created successfully", data: newCase });
  } catch (error) {
    next(error);
  }
};

// Update an existing case
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      caseNumber,
      caseName,
      natureId,
      registrationDate,
      registrationFee,
      sectionCourtRoom,
      facts,
      relatedLaws,
      referredThrough,
      noticeStatus,
      fullJudgmentDate,
      judgmentVerifyDate,
      status
    } = req.body;

    const caseData = await prisma.case.findUnique({
      where: { id: id as string },
    });

    if (!caseData) {
      throw createHttpError(404, "Case not found");
    }

    if (caseNumber && caseNumber !== caseData.caseNumber) {
      const existingCase = await prisma.case.findUnique({
        where: { caseNumber },
      });

      if (existingCase) {
        throw createHttpError(409, "A case with this Case Number already exists");
      }
    }

    const updatedCase = await prisma.case.update({
      where: { id: id as string },
      data: {
        caseNumber,
        caseName,
        natureId: natureId ? natureId : undefined,
        registrationDate: registrationDate ? new Date(registrationDate) : undefined,
        registrationFee,
        sectionCourtRoom,
        facts,
        relatedLaws,
        referredThrough,
        noticeStatus,
        fullJudgmentDate: fullJudgmentDate ? new Date(fullJudgmentDate) : undefined,
        judgmentVerifyDate: judgmentVerifyDate ? new Date(judgmentVerifyDate) : undefined,
        status
      },
    });

    res.json({ message: "Case updated successfully", data: updatedCase });
  } catch (error) {
    next(error);
  }
};

// Delete a case
export const destroy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const caseData = await prisma.case.findUnique({
      where: { id: id as string },
    });

    if (!caseData) {
      throw createHttpError(404, "Case not found");
    }

    await prisma.case.delete({
      where: { id: id as string },
    });

    res.json({ message: "Case deleted successfully" });
  } catch (error) {
    next(error);
  }
};
