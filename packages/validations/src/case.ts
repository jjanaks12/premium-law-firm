import * as yup from 'yup';

export const caseValidationSchema = yup.object({
  natureId: yup.string().required("Nature ID is required"),
  facts: yup.string().nullable(),
  status: yup.string().required("Status is required"),
  courtDetails: yup.array().of(
    yup.object({
      caseName: yup.string().trim().required("Case Name is required"),
      caseNumber: yup.string().trim(),
      registrationDate: yup.date().nullable(),
      sectionCourtRoom: yup.string().nullable(),
    })
  ).min(1, "At least one court detail is required"),
  parties: yup.array().of(
    yup.object({
      partyName: yup.string().required("Party Name is required"),
      roleId: yup.string().required("Role is required"),
      citizenshipNo: yup.string().nullable(),
      permanentAddress: yup.string().nullable(),
      temporaryAddress: yup.string().nullable(),
      contactNo: yup.string().nullable(),
      waris: yup.object({
        partyName: yup.string().required("Waris name is required"),
        citizenshipNo: yup.string().nullable(),
        permanentAddress: yup.string().nullable(),
        temporaryAddress: yup.string().nullable(),
        contactNo: yup.string().nullable(),
      }).nullable().default(null),
    })
  ).nullable(),
  referredThrough: yup.string().nullable(),
  lawyers: yup.array().of(
    yup.object({
      userId: yup.string().required("User ID is required"),
      isLead: yup.boolean().optional(),
    })
  ).nullable(),
});
