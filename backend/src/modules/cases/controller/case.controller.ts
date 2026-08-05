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
          { courtDetails: { some: { caseNumber: { contains: searchStr, mode: "insensitive" }, isActive: true } } },
          { courtDetails: { some: { caseName: { contains: searchStr, mode: "insensitive" }, isActive: true } } },
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
        courtDetails: { where: { isActive: true } },
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
        courtDetails: true,
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
        hearings: {
          include: { caseCourtDetail: true }
        },
        judgements: {
          include: { caseCourtDetail: true }
        },
        payments: {
          include: { receivedByUser: true }
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
      natureId,
      facts,
      details,
      relatedLaw,
      referredThrough,
      noticeStatus,
      parties,
      lawyers,
      status,
      courtDetails
    } = req.body;

    // Check if case with same number exists
    if (courtDetails && courtDetails.length > 0) {
      const caseNumber = courtDetails[0].caseNumber;
      if (caseNumber) {
        const existingCaseDetail = await prisma.caseCourtDetail.findFirst({
          where: { caseNumber },
        });

        if (existingCaseDetail) {
          throw createHttpError(409, "A case with this Case Number already exists");
        }
      }
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
        natureId,
        facts,
        details,
        relatedLaw,
        referredThrough,
        noticeStatus,
        status: status || "Draft",
        courtDetails: courtDetails && courtDetails.length > 0 ? {
          create: courtDetails.map((cd: any) => ({
            caseName: cd.caseName,
            caseNumber: cd.caseNumber || "",
            registrationDate: cd.registrationDate ? new Date(cd.registrationDate) : null,
            sectionCourtRoom: cd.sectionCourtRoom,
            judgeName: cd.judgeName,
            courtType: cd.courtType,
            isActive: true,
          }))
        } : undefined,
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
        courtDetails: true,
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
      natureId,
      facts,
      details,
      relatedLaw,
      referredThrough,
      noticeStatus,
      fullJudgmentDate,
      judgmentVerifyDate,
      status,
      parties,
      lawyers,
      courtDetails
    } = req.body;

    const caseData = await prisma.case.findUnique({
      where: { id: id as string },
    });

    if (!caseData) {
      throw createHttpError(404, "Case not found");
    }

    // For now we'll just handle updating court details completely 
    // or adding a new active court detail.
    if (courtDetails && courtDetails.length > 0) {
      for (const cd of courtDetails) {
        if (cd.caseNumber) {
          const existingDetail = await prisma.caseCourtDetail.findFirst({
            where: { caseNumber: cd.caseNumber },
          });
          // Check if it belongs to another case
          if (existingDetail && existingDetail.caseId !== (id as string)) {
            throw createHttpError(409, `A case with Case Number ${cd.caseNumber} already exists`);
          }
        }
      }
    }

    const warisRole = await prisma.partyRole.findUnique({
      where: { name: 'Waris' },
    });
    const warisRoleId = warisRole?.id;

    const updatedCase = await prisma.case.update({
      where: { id: id as string },
      data: {
        natureId: natureId ? natureId : undefined,
        facts,
        details,
        relatedLaw,
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

    if (courtDetails && Array.isArray(courtDetails)) {
      for (const cd of courtDetails) {
        if (cd.id) {
          await prisma.caseCourtDetail.update({
            where: { id: cd.id },
            data: {
              caseName: cd.caseName,
              caseNumber: cd.caseNumber || "",
              registrationDate: cd.registrationDate ? new Date(cd.registrationDate) : null,
              sectionCourtRoom: cd.sectionCourtRoom,
              judgeName: cd.judgeName,
              courtType: cd.courtType,
              isActive: cd.isActive !== undefined ? cd.isActive : true,
            }
          });
        } else {
          await prisma.caseCourtDetail.create({
            data: {
              caseId: id as string,
              caseName: cd.caseName,
              caseNumber: cd.caseNumber || "",
              registrationDate: cd.registrationDate ? new Date(cd.registrationDate) : null,
              sectionCourtRoom: cd.sectionCourtRoom,
              judgeName: cd.judgeName,
              courtType: cd.courtType,
              parentId: cd.parentId || null,
              isActive: cd.isActive !== undefined ? cd.isActive : true,
            }
          });
        }
      }
    }

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

export const migrateCase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { parent_id, room_no, judge_name, court_level } = req.body;

    if (!parent_id) {
      throw createHttpError(400, "parent_id is required");
    }

    const parentDetail = await prisma.caseCourtDetail.findUnique({
      where: { id: parent_id },
    });

    if (!parentDetail) {
      throw createHttpError(404, "Parent court detail not found");
    }

    // Perform in a transaction to ensure data integrity
    const newDetail = await prisma.$transaction(async (tx) => {
      // Deactivate parent
      await tx.caseCourtDetail.update({
        where: { id: parent_id },
        data: { isActive: false },
      });

      // Create new detail
      return await tx.caseCourtDetail.create({
        data: {
          caseId: parentDetail.caseId,
          caseName: parentDetail.caseName,
          caseNumber: parentDetail.caseNumber,
          registrationDate: parentDetail.registrationDate,
          parentId: parent_id,
          isActive: true,
          judgeName: judge_name,
          courtType: court_level,
          sectionCourtRoom: room_no,
        },
      });
    });

    res.status(201).json({ message: "Case migrated successfully", data: newDetail });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalClients = await prisma.caseParty.count();
    const activeCases = await prisma.case.count({ where: { status: 'Active' } });
    const payments = await prisma.casePayment.aggregate({
      _sum: { amount: true },
    });
    
    const revenue = payments._sum.amount ? Number(payments._sum.amount) : 0;

    const upcomingHearings = await prisma.caseHearing.findMany({
      where: {
        nextHearingDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      },
      include: {
        case: {
          include: {
            courtDetails: {
              where: { isActive: true },
              take: 1,
            }
          }
        }
      },
      orderBy: {
        nextHearingDate: 'asc'
      },
      take: 10
    });

    res.json({
      success: true,
      data: {
        totalClients,
        activeCases,
        revenue,
        upcomingHearings,
      },
    });
  } catch (error) {
    next(error);
  }
};
