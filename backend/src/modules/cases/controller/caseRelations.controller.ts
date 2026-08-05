import prisma from "@/lib/prisma";
import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { queueEmail } from "@/modules/notifications/notification.queue";

export const getPartyRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await prisma.partyRole.findMany({ orderBy: { name: 'asc' } });
    res.json({ data: roles });
  } catch (error) { next(error); }
};

export const addPartyRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, nepaliName } = req.body;
    const role = await prisma.partyRole.create({ data: { name, nepaliName } });
    res.status(201).json({ data: role });
  } catch (error) { next(error); }
};

export const updatePartyRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, nepaliName } = req.body;
    const role = await prisma.partyRole.update({ where: { id: id as string }, data: { name, nepaliName } });
    res.json({ data: role });
  } catch (error) { next(error); }
};

export const deletePartyRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.partyRole.delete({ where: { id: id as string } });
    res.json({ message: "Role deleted successfully" });
  } catch (error) { next(error); }
};

export const getCourtLevels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const levels = await prisma.courtLevel.findMany({ orderBy: { name: 'asc' } });
    res.json({ data: levels });
  } catch (error) { next(error); }
};

export const addCourtLevel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, nepaliName } = req.body;
    const level = await prisma.courtLevel.create({ data: { name, nepaliName } });
    res.status(201).json({ data: level });
  } catch (error) { next(error); }
};

export const updateCourtLevel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, nepaliName } = req.body;
    const level = await prisma.courtLevel.update({ where: { id: id as string }, data: { name, nepaliName } });
    res.json({ data: level });
  } catch (error) { next(error); }
};

export const deleteCourtLevel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.courtLevel.delete({ where: { id: id as string } });
    res.json({ message: "Court level deleted successfully" });
  } catch (error) { next(error); }
};

// PARTIES
export const addParty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { partyName, roleId, fee, citizenshipNo, permanentAddress, temporaryAddress, contactNo, waris } = req.body;
    
    const warisRole = await prisma.partyRole.findUnique({
      where: { name: 'Waris' },
    });
    const warisRoleId = warisRole?.id;

    const party = await prisma.caseParty.create({
      data: { 
        caseId: id as string, 
        partyName, 
        roleId, 
        fee, 
        citizenshipNo, 
        permanentAddress, 
        temporaryAddress, 
        contactNo,
        waris: waris && waris.partyName && warisRoleId ? {
          create: [
            {
              caseId: id as string,
              partyName: waris.partyName,
              roleId: warisRoleId,
              citizenshipNo: waris.citizenshipNo,
              permanentAddress: waris.permanentAddress,
              temporaryAddress: waris.temporaryAddress,
              contactNo: waris.contactNo,
            }
          ]
        } : undefined
      }
    });
    res.status(201).json({ data: party });
  } catch (error) { next(error); }
};
export const updateParty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, subId } = req.params;
    const { partyName, roleId, fee, citizenshipNo, permanentAddress, temporaryAddress, contactNo, waris } = req.body;
    
    const warisRole = await prisma.partyRole.findUnique({
      where: { name: 'Waris' },
    });
    const warisRoleId = warisRole?.id;

    const party = await prisma.caseParty.update({
      where: { id: subId as string },
      data: { 
        partyName, 
        roleId, 
        fee, 
        citizenshipNo, 
        permanentAddress, 
        temporaryAddress, 
        contactNo,
        waris: {
          deleteMany: {},
          ...(waris && waris.partyName && warisRoleId ? {
            create: [
              {
                caseId: id as string,
                partyName: waris.partyName,
                roleId: warisRoleId,
                citizenshipNo: waris.citizenshipNo,
                permanentAddress: waris.permanentAddress,
                temporaryAddress: waris.temporaryAddress,
                contactNo: waris.contactNo,
              }
            ]
          } : {})
        }
      }
    });
    res.json({ data: party });
  } catch (error) { next(error); }
};
export const removeParty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.caseParty.delete({ where: { id: req.params.subId as string } });
    res.json({ message: "Party removed" });
  } catch (error) { next(error); }
};

// LAWYERS
export const addLawyer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { userId, isLead } = req.body;
    const lawyer = await prisma.caseLawyer.create({
      data: { caseId: id as string, userId, isLead }
    });
    
    // Notify the user about the case assignment
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const caseData = await prisma.case.findUnique({ 
      where: { id: id as string },
      include: { courtDetails: { where: { isActive: true } } }
    });

    if (user && caseData) {
      const activeDetail = caseData.courtDetails?.find((d: any) => d.isActive) || caseData.courtDetails?.[0];
      const caseNum = activeDetail?.caseNumber || "N/A";
      const caseNm = activeDetail?.caseName || "N/A";
      await queueEmail({
        to: user.email,
        subject: `Assigned to Case: ${caseNum}`,
        text: `Hello ${user.first_name},\n\nYou have been assigned as a ${isLead ? 'Lead Lawyer' : 'Lawyer'} for the case "${caseNm}" (${caseNum}).\n\nPlease log in to view the case details.`,
        userId: user.id
      });
    }

    res.status(201).json({ data: lawyer });
  } catch (error) { next(error); }
};
export const removeLawyer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, subId } = req.params; // subId is userId
    await prisma.caseLawyer.delete({
      where: { caseId_userId: { caseId: id as string, userId: subId as string } }
    });
    res.json({ message: "Lawyer removed" });
  } catch (error) { next(error); }
};

// HEARINGS
export const addHearing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { hearingDate, nextHearingDate, hearingOrder, caseCourtDetailId } = req.body;
    const hearing = await prisma.caseHearing.create({
      data: {
        caseId: id as string,
        hearingDate: hearingDate ? new Date(hearingDate) : null,
        nextHearingDate: nextHearingDate ? new Date(nextHearingDate) : null,
        hearingOrder,
        caseCourtDetailId
      }
    });
    res.status(201).json({ data: hearing });
  } catch (error) { next(error); }
};
export const removeHearing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.caseHearing.delete({ where: { id: req.params.subId as string } });
    res.json({ message: "Hearing removed" });
  } catch (error) { next(error); }
};

// PLEADINGS
export const addPleading = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { pleaderUserId, pleadingDate, pleadingNotes } = req.body;
    const pleading = await prisma.casePleading.create({
      data: {
        caseId: id as string,
        pleaderUserId,
        pleadingDate: pleadingDate ? new Date(pleadingDate) : null,
        pleadingNotes
      }
    });
    res.status(201).json({ data: pleading });
  } catch (error) { next(error); }
};
export const removePleading = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.casePleading.delete({ where: { id: req.params.subId as string } });
    res.json({ message: "Pleading removed" });
  } catch (error) { next(error); }
};

// PROCEEDINGS
export const addProceeding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { courtLevelId, courtName, judgeName, chargeCounseling, verdict } = req.body;
    const proceeding = await prisma.courtProceeding.create({
      data: { caseId: id as string, courtLevelId, courtName, judgeName, chargeCounseling, verdict }
    });
    res.status(201).json({ data: proceeding });
  } catch (error) { next(error); }
};
export const removeProceeding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.courtProceeding.delete({ where: { id: req.params.subId as string } });
    res.json({ message: "Proceeding removed" });
  } catch (error) { next(error); }
};


// PAYMENTS
export const addPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { amount, paymentDate, method, referenceNo, receivedBy, receivedByUserId, notes } = req.body;
    const payment = await prisma.casePayment.create({
      data: {
        caseId: id as string,
        amount,
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        method,
        referenceNo,
        receivedBy,
        receivedByUserId,
        notes
      }
    });
    res.status(201).json({ data: payment });
  } catch (error) { next(error); }
};
export const removePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.casePayment.delete({ where: { id: req.params.subId as string } });
    res.json({ message: "Payment removed" });
  } catch (error) { next(error); }
};



// DOCUMENTS
export const addDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { fileName, description } = req.body;

    let documentUrl = "";
    if (req.file) {
      documentUrl = `/uploads/${req.file.filename}`;
    }

    const document = await prisma.caseDocument.create({
      data: {
        caseId: id as string,
        fileName: fileName || (req.file ? req.file.originalname : "Document"),
        description,
        documentUrl
      }
    });
    res.status(201).json({ data: document });
  } catch (error) { next(error); }
};

export const removeDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.caseDocument.delete({ where: { id: req.params.subId as string } });
    res.json({ message: "Document removed" });
  } catch (error) { next(error); }
};
