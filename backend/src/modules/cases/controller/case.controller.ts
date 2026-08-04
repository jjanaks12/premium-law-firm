import prisma from "@/lib/prisma";
import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { v4 as uuidv4 } from "uuid";

// Get all cases
export const index = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, natureId, status, partyName } = req.query;

    const filter: any = { AND: [] };

    if (natureId) {
      filter.AND.push({ natureId: natureId as string });
    }

    if (status) {
      filter.AND.push({ status: status as string });
    }

    if (partyName) {
      filter.AND.push({
        parties: {
          some: {
            partyName: { contains: partyName as string, mode: "insensitive" }
          }
        }
      });
    }

    if (search) {
      const searchStr = search as string;
      filter.AND.push({
        OR: [
          { caseNumber: { contains: searchStr, mode: "insensitive" } },
          { caseName: { contains: searchStr, mode: "insensitive" } },
        ]
      });
    }

    // Apply role-based access restrictions
    if (req.auth_user?.role?.name !== "Admin") {
      filter.AND.push({
        OR: [
          { createdById: req.auth_user?.id },
          { lawyers: { some: { userId: req.auth_user?.id } } }
        ]
      });
    }

    if (filter.AND.length === 0) {
      delete filter.AND;
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
          where: { parentId: null },
          include: {
            role: true,
            waris: true,
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

    const warisRole = await prisma.partyRole.findUnique({
      where: { name: 'Waris' },
    });
    const warisRoleId = warisRole?.id;

    const newCaseId = uuidv4();

    const newCase = await prisma.case.create({
      data: {
        id: newCaseId,
        createdById: req.auth_user?.id,
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
            citizenshipNo: party.citizenshipNo,
            permanentAddress: party.permanentAddress,
            temporaryAddress: party.temporaryAddress,
            contactNo: party.contactNo,
            waris: party.waris && party.waris.partyName && warisRoleId ? {
              create: [
                {
                  caseId: newCaseId,
                  partyName: party.waris.partyName,
                  roleId: warisRoleId,
                  citizenshipNo: party.waris.citizenshipNo,
                  permanentAddress: party.waris.permanentAddress,
                  temporaryAddress: party.waris.temporaryAddress,
                  contactNo: party.waris.contactNo,
                }
              ]
            } : undefined
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
      status,
      parties,
      lawyers
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

    const warisRole = await prisma.partyRole.findUnique({
      where: { name: 'Waris' },
    });
    const warisRoleId = warisRole?.id;

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
        status,
        parties: parties ? {
          deleteMany: {},
          create: parties.map((party: any) => ({
            partyName: party.partyName,
            roleId: party.roleId,
            fee: party.fee,
            citizenshipNo: party.citizenshipNo,
            permanentAddress: party.permanentAddress,
            temporaryAddress: party.temporaryAddress,
            contactNo: party.contactNo,
            waris: party.waris && party.waris.partyName && warisRoleId ? {
              create: [
                {
                  caseId: id as string,
                  partyName: party.waris.partyName,
                  roleId: warisRoleId,
                  citizenshipNo: party.waris.citizenshipNo,
                  permanentAddress: party.waris.permanentAddress,
                  temporaryAddress: party.waris.temporaryAddress,
                  contactNo: party.waris.contactNo,
                }
              ]
            } : undefined
          }))
        } : undefined,
        lawyers: lawyers ? {
          deleteMany: {},
          create: lawyers.map((lawyer: any) => ({
            userId: lawyer.userId,
            isLead: lawyer.isLead || false,
          }))
        } : undefined,
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
