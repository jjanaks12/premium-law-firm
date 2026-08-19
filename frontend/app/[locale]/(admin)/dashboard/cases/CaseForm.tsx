"use client";

import { useState, useEffect } from "react";
import {
  Formik,
  Form,
  Field,
  FieldProps,
  ErrorMessage,
  FieldArray,
} from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2Icon, PlusIcon, Trash2Icon } from "lucide-react";
import { useAxios } from "@/lib/services/axios.service";
import { toast } from "@/components/ui/toast";
import { useTranslations, useLocale } from "next-intl";
import dayjs from "dayjs";
import { CaseData, PartyRole } from "@app/types";
import { CaseNatureData } from "../case-natures/page";
import { caseValidationSchema } from "@app/validations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { CaseMigrationModal } from "./CaseMigrationModal";

interface CaseFormProps {
  caseData?: CaseData;
  onSuccess: () => void;
  onClose: () => void;
  isEditing: boolean;
}

export default function CaseForm({
  caseData,
  onSuccess,
  onClose,
  isEditing,
}: CaseFormProps) {
  const { axios } = useAxios();
  const t = useTranslations("CasesPage");
  const locale = useLocale();

  const [natures, setNatures] = useState<CaseNatureData[]>([]);
  const [loadingNatures, setLoadingNatures] = useState(true);
  const [partyRoles, setPartyRoles] = useState<PartyRole[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [courtLevels, setCourtLevels] = useState<any[]>([]);
  const [loadingCourtLevels, setLoadingCourtLevels] = useState(true);
  const [lawyerUsers, setLawyerUsers] = useState<any[]>([]);
  const [loadingLawyers, setLoadingLawyers] = useState(true);

  useEffect(() => {
    const fetchNatures = async () => {
      try {
        const { data } = await axios.get("/case-natures");
        if (data.data) {
          setNatures(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch case natures:", err);
      } finally {
        setLoadingNatures(false);
      }
    };

    const fetchPartyRoles = async () => {
      try {
        const { data } = await axios.get("/cases/meta/party-roles");
        if (data.data) {
          setPartyRoles(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch party roles:", err);
      } finally {
        setLoadingRoles(false);
      }
    };

    const fetchLawyers = async () => {
      try {
        const { data } = await axios.get("/users?status=active");
        if (data.data) {
          const lawyers = data.data.filter(
            (u: any) => u.role?.name?.toLowerCase() === "lawyer",
          );
          setLawyerUsers(lawyers);
        }
      } catch (err) {
        console.error("Failed to fetch lawyers:", err);
      } finally {
        setLoadingLawyers(false);
      }
    };

    const fetchCourtLevels = async () => {
      try {
        const { data } = await axios.get("/cases/meta/court-levels");
        if (data.data) {
          setCourtLevels(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch court levels:", err);
      } finally {
        setLoadingCourtLevels(false);
      }
    };

    fetchNatures();
    fetchPartyRoles();
    fetchCourtLevels();
    fetchLawyers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (
    values: any,
    { setSubmitting }: { setSubmitting: (submitting: boolean) => void },
  ) => {
    try {
      if (isEditing && caseData?.id) {
        const { data } = await axios.patch(`/cases/${caseData.id}`, values);
        if (data.data) {
          toast.add({
            title: "Success",
            description: "Case updated successfully",
            type: "success",
          });
          onSuccess();
        }
      } else {
        const { data } = await axios.post("/cases", values);
        if (data.data) {
          toast.add({
            title: "Success",
            description: "Case created successfully",
            type: "success",
          });
          onSuccess();
        }
      }
    } catch (err: any) {
      toast.add({
        title: "Error",
        description:
          err.response?.data?.message || err.message || "Action failed",
        type: "danger",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const activeCourtDetail =
    caseData?.courtDetails?.find((d: any) => d.isActive) ||
    caseData?.courtDetails?.[0];

  const initialValues = {
    natureId: caseData?.natureId || "",
    referredThrough: caseData?.referredThrough || "",
    courtDetails: [
      {
        caseNumber: activeCourtDetail?.caseNumber || "",
        caseName: activeCourtDetail?.caseName || "",
        courtLevelId: activeCourtDetail?.courtLevelId || "",
        courtName: activeCourtDetail?.courtName || "",
        sectionCourtRoom: activeCourtDetail?.sectionCourtRoom || "",
        registrationDate: activeCourtDetail?.registrationDate
          ? dayjs(activeCourtDetail.registrationDate).format("YYYY-MM-DD")
          : "",
      },
    ],
    facts: caseData?.facts || "",
    relatedPrecedents: caseData?.relatedPrecedents || [],
    status: caseData?.status || "Draft",
    lawyers: caseData?.lawyers?.length
      ? caseData.lawyers.map((l: any) => ({
          userId: l.userId,
          isLead: l.isLead,
        }))
      : [],
    parties: caseData?.parties?.length
      ? caseData.parties.map((p: any) => ({
          ...p,
          waris: p.waris?.[0] || null,
        }))
      : [
          {
            partyName: "",
            roleId: "",
            citizenshipNo: "",
            permanentAddress: "",
            temporaryAddress: "",
            contactNo: "",
            waris: null,
          },
        ],
  };

  const getParty = (partyName: string) => {
    return partyRoles?.find(
      (role: any) => role.name === partyName || role.nepaliName === partyName,
    );
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={caseValidationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4">
          <div className="space-y-4 border rounded-md p-4 bg-muted/20">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{t("courtDetails")}</h3>
              {isEditing && activeCourtDetail?.id && (
                <CaseMigrationModal
                  parentId={activeCourtDetail.id}
                  onSuccess={onSuccess}
                />
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="caseName">
                  {t("formName")} <span className="text-destructive">*</span>
                </Label>
                <Field name="courtDetails[0].caseName">
                  {({ field }: FieldProps) => (
                    <Input {...field} id="caseName" />
                  )}
                </Field>
                <ErrorMessage
                  name="courtDetails[0].caseName"
                  component="div"
                  className="text-sm text-destructive"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caseNumber">
                  {t("formNumber")} <span className="text-destructive">*</span>
                </Label>
                <Field name="courtDetails[0].caseNumber">
                  {({ field }: FieldProps) => (
                    <Input {...field} id="caseNumber" />
                  )}
                </Field>
                <ErrorMessage
                  name="courtDetails[0].caseNumber"
                  component="div"
                  className="text-sm text-destructive"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationDate">{t("formRegDate")}</Label>
                <Field name="courtDetails[0].registrationDate">
                  {({ field, form }: FieldProps) => (
                    <DatePicker
                      id="registrationDate"
                      value={field.value}
                      onChange={(date) => {
                        form.setFieldValue(
                          field.name,
                          date ? dayjs(date).format("YYYY-MM-DD") : "",
                        );
                      }}
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="courtDetails[0].registrationDate"
                  component="div"
                  className="text-sm text-destructive"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="natureId">
                  {t("formNature")} <span className="text-destructive">*</span>
                </Label>
                <Field name="natureId">
                  {({ field, form }: FieldProps) => (
                    <Select
                      onValueChange={(value) =>
                        form.setFieldValue(field.name, value)
                      }
                      value={field.value?.toString() || null}
                    >
                      <SelectTrigger
                        id="natureId"
                        disabled={loadingNatures}
                        className="w-full"
                      >
                        <SelectValue placeholder="Select a case nature">
                          {(() => {
                            if (!field.value) return "Select a case nature";
                            const n = natures.find(
                              (x) =>
                                x.id.toString() === field.value?.toString(),
                            );
                            if (!n) return "Select a case nature";
                            return locale === "np" && n.nepaliName
                              ? n.nepaliName
                              : n.name;
                          })()}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {natures.map((nature) => (
                          <SelectItem
                            key={nature.id}
                            value={nature.id.toString()}
                          >
                            {locale === "np" && nature.nepaliName
                              ? nature.nepaliName
                              : nature.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </Field>
                <ErrorMessage
                  name="natureId"
                  component="div"
                  className="text-sm text-destructive"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="courtLevelId">{t("courtLevel")}</Label>
                <Field name="courtDetails[0].courtLevelId">
                  {({ field, form }: FieldProps) => (
                    <Select
                      onValueChange={(value) =>
                        form.setFieldValue(field.name, value)
                      }
                      value={field.value?.toString() || null}
                    >
                      <SelectTrigger
                        id="courtLevelId"
                        disabled={loadingCourtLevels}
                        className="w-full"
                      >
                        <SelectValue placeholder={t("selectCourtLevel")}>
                          {(() => {
                            if (!field.value) return t("selectCourtLevel");
                            const cl = courtLevels.find(
                              (x) =>
                                x.id.toString() === field.value?.toString(),
                            );
                            if (!cl) return t("selectCourtLevel");
                            return locale === "np" && cl.nepaliName
                              ? cl.nepaliName
                              : cl.name;
                          })()}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {courtLevels.map((cl) => (
                          <SelectItem key={cl.id} value={cl.id.toString()}>
                            {locale === "np" && cl.nepaliName
                              ? cl.nepaliName
                              : cl.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </Field>
                <ErrorMessage
                  name="courtDetails[0].courtLevelId"
                  component="div"
                  className="text-sm text-destructive"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="courtName">{t("courtName")}</Label>
                <Field name="courtDetails[0].courtName">
                  {({ field }: FieldProps) => (
                    <Input {...field} id="courtName" />
                  )}
                </Field>
                <ErrorMessage
                  name="courtDetails[0].courtName"
                  component="div"
                  className="text-sm text-destructive"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sectionCourtRoom">{t("formFaat")}</Label>
                <Field name="courtDetails[0].sectionCourtRoom">
                  {({ field }: FieldProps) => (
                    <Input {...field} id="sectionCourtRoom" />
                  )}
                </Field>
                <ErrorMessage
                  name="courtDetails[0].sectionCourtRoom"
                  component="div"
                  className="text-sm text-destructive"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="referredThrough">{t("formReferredFrom")}</Label>
              <Field name="referredThrough">
                {({ field }: FieldProps) => (
                  <Input {...field} id="referredThrough" />
                )}
              </Field>
              <ErrorMessage
                name="referredThrough"
                component="div"
                className="text-sm text-destructive"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Field name="status">
                {({ field, form }: FieldProps) => (
                  <Select
                    onValueChange={(value) =>
                      form.setFieldValue(field.name, value)
                    }
                    value={field.value}
                  >
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </Field>
              <ErrorMessage
                name="status"
                component="div"
                className="text-sm text-destructive"
              />
            </div>
          </div>

          <div className="space-y-4 border rounded-md p-4 bg-muted/20">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{t("formPartiesTitle")}</h3>
            </div>
            <FieldArray name="parties">
              {({ insert, remove, push, form }) => {
                const renderParty = (party: any, index: number) => (
                  <div
                    key={party.id || `party-${index}`}
                    className="space-y-4 border p-4 rounded-md bg-background relative h-full flex flex-col justify-start"
                  >
                    <div className="flex justify-end items-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive h-8 w-8"
                        onClick={() => remove(index)}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                      <div className="space-y-2">
                        <Label>
                          {t("formPartyName")}{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Field name={`parties.${index}.partyName`}>
                          {({ field }: FieldProps) => (
                            <Input
                              {...field}
                              placeholder={t("formPartyName")}
                            />
                          )}
                        </Field>
                        <ErrorMessage
                          name={`parties.${index}.partyName`}
                          component="div"
                          className="text-sm text-destructive"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          {t("formRole")}{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Field name={`parties.${index}.roleId`}>
                          {({ field, form }: FieldProps) => (
                            <Select
                              onValueChange={(val) =>
                                form.setFieldValue(field.name, val)
                              }
                              value={field.value?.toString() || null}
                            >
                              <SelectTrigger
                                disabled={loadingRoles}
                                className="w-full"
                              >
                                <SelectValue placeholder={t("formSelectRole")}>
                                  {(() => {
                                    if (!field.value)
                                      return t("formSelectRole");
                                    const r = partyRoles.find(
                                      (x) => x.id === field.value,
                                    );
                                    if (!r) return t("formSelectRole");
                                    return locale === "np" && r.nepaliName
                                      ? r.nepaliName
                                      : r.name;
                                  })()}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {partyRoles.map((role) => (
                                  <SelectItem
                                    key={role.id}
                                    value={role.id.toString()}
                                  >
                                    {locale === "np" && role.nepaliName
                                      ? role.nepaliName
                                      : role.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </Field>
                        <ErrorMessage
                          name={`parties.${index}.roleId`}
                          component="div"
                          className="text-sm text-destructive"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("formCitizenshipNo")}</Label>
                        <Field name={`parties.${index}.citizenshipNo`}>
                          {({ field }: FieldProps) => (
                            <Input
                              {...field}
                              placeholder={t("formCitizenshipNo")}
                            />
                          )}
                        </Field>
                        <ErrorMessage
                          name={`parties.${index}.citizenshipNo`}
                          component="div"
                          className="text-sm text-destructive"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("formContactNo")}</Label>
                        <Field name={`parties.${index}.contactNo`}>
                          {({ field }: FieldProps) => (
                            <Input
                              {...field}
                              placeholder={t("formContactNo")}
                            />
                          )}
                        </Field>
                        <ErrorMessage
                          name={`parties.${index}.contactNo`}
                          component="div"
                          className="text-sm text-destructive"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("formPermanentAddress")}</Label>
                        <Field name={`parties.${index}.permanentAddress`}>
                          {({ field }: FieldProps) => (
                            <Input
                              {...field}
                              placeholder={t("formPermanentAddress")}
                            />
                          )}
                        </Field>
                        <ErrorMessage
                          name={`parties.${index}.permanentAddress`}
                          component="div"
                          className="text-sm text-destructive"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("formTemporaryAddress")}</Label>
                        <Field name={`parties.${index}.temporaryAddress`}>
                          {({ field }: FieldProps) => (
                            <Input
                              {...field}
                              placeholder={t("formTemporaryAddress")}
                            />
                          )}
                        </Field>
                        <ErrorMessage
                          name={`parties.${index}.temporaryAddress`}
                          component="div"
                          className="text-sm text-destructive"
                        />
                      </div>
                    </div>

                    {/* Waris Section */}
                    <div className="space-y-4 pt-4 border-t mt-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`parties.${index}.hasWaris`}
                          checked={!!form.values.parties[index].waris}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              form.setFieldValue(`parties.${index}.waris`, {
                                partyName: "",
                                citizenshipNo: "",
                                permanentAddress: "",
                                temporaryAddress: "",
                                contactNo: "",
                              });
                            } else {
                              form.setFieldValue(
                                `parties.${index}.waris`,
                                null,
                              );
                            }
                          }}
                        />
                        <Label htmlFor={`parties.${index}.hasWaris`}>
                          {t("formHasWaris")}
                        </Label>
                      </div>

                      {form.values.parties[index].waris && (
                        <div className="pl-6 border-l-2 border-primary/20 space-y-4">
                          <h5 className="text-sm font-semibold">
                            {t("formHasWaris")}
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>
                                {t("formWarisName")}{" "}
                                <span className="text-destructive">*</span>
                              </Label>
                              <Field name={`parties.${index}.waris.partyName`}>
                                {({ field }: FieldProps) => (
                                  <Input
                                    {...field}
                                    placeholder={t("formWarisName")}
                                  />
                                )}
                              </Field>
                              <ErrorMessage
                                name={`parties.${index}.waris.partyName`}
                                component="div"
                                className="text-sm text-destructive"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>{t("formWarisCitizenship")}</Label>
                              <Field
                                name={`parties.${index}.waris.citizenshipNo`}
                              >
                                {({ field }: FieldProps) => (
                                  <Input
                                    {...field}
                                    placeholder={t("formWarisCitizenship")}
                                  />
                                )}
                              </Field>
                            </div>
                            <div className="space-y-2">
                              <Label>{t("formWarisContact")}</Label>
                              <Field name={`parties.${index}.waris.contactNo`}>
                                {({ field }: FieldProps) => (
                                  <Input
                                    {...field}
                                    placeholder={t("formWarisContact")}
                                  />
                                )}
                              </Field>
                            </div>
                            <div className="space-y-2">
                              <Label>{t("formWarisPermanentAddress")}</Label>
                              <Field
                                name={`parties.${index}.waris.permanentAddress`}
                              >
                                {({ field }: FieldProps) => (
                                  <Input
                                    {...field}
                                    placeholder={t("formWarisPermanentAddress")}
                                  />
                                )}
                              </Field>
                            </div>
                            <div className="space-y-2">
                              <Label>{t("formWarisTemporaryAddress")}</Label>
                              <Field
                                name={`parties.${index}.waris.temporaryAddress`}
                              >
                                {({ field }: FieldProps) => (
                                  <Input
                                    {...field}
                                    placeholder={t("formWarisTemporaryAddress")}
                                  />
                                )}
                              </Field>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );

                const renderPratibaadi = () => {
                  return (
                    form.values.parties &&
                    form.values.parties.map((party: any, index: number) => {
                      const role = partyRoles.find(
                        (r: any) => r.id === party.roleId,
                      );
                      if (
                        role &&
                        (role.name === "प्रतिवादी" ||
                          role.name === "Pratibadi" ||
                          role.name === "Defendant")
                      ) {
                        return renderParty(party, index);
                      }
                      return null;
                    })
                  );
                };

                const renderOthers = () => {
                  const hasOthers =
                    form.values.parties &&
                    form.values.parties.filter((party: any) => {
                      const role = partyRoles.find(
                        (r: any) => r.id === party.roleId,
                      );
                      return (
                        !role ||
                        (role.name !== "वादी" &&
                          role.name !== "Baadi" &&
                          role.name !== "Plaintiff" &&
                          role.name !== "प्रतिवादी" &&
                          role.name !== "Pratibadi" &&
                          role.name !== "Defendant")
                      );
                    }).length > 0;

                  if (!hasOthers) return null;

                  return (
                    <div className="space-y-4 pt-6 border-t col-span-full">
                      <h4 className="font-semibold text-lg">
                        {t("formOtherPartiesTitle")}
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {form.values.parties.map(
                          (party: any, index: number) => {
                            const role = partyRoles.find(
                              (r: any) => r.id === party.roleId,
                            );
                            if (
                              !role ||
                              (role.name !== "वादी" &&
                                role.name !== "Baadi" &&
                                role.name !== "Plaintiff" &&
                                role.name !== "प्रतिवादी" &&
                                role.name !== "Pratibadi" &&
                                role.name !== "Defendant")
                            ) {
                              return renderParty(party, index);
                            }
                            return null;
                          },
                        )}
                      </div>
                    </div>
                  );
                };

                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                      {/* Baadi Column */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                          <h4 className="font-semibold text-lg">
                            {t("formBaadiTitle")}
                          </h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              push({
                                partyName: "",
                                roleId:
                                  getParty("वादी")?.id ||
                                  getParty("Plaintiff")?.id ||
                                  partyRoles[0]?.id ||
                                  "",
                                citizenshipNo: "",
                                permanentAddress: "",
                                temporaryAddress: "",
                                contactNo: "",
                                waris: null,
                              })
                            }
                          >
                            <PlusIcon className="mr-2 h-4 w-4" />{" "}
                            {t("addBaadiBtn")}
                          </Button>
                        </div>
                        <div className="space-y-4 flex flex-col">
                          {form.values.parties &&
                            form.values.parties.map(
                              (party: any, index: number) => {
                                if (
                                  party &&
                                  party.roleId === getParty("वादी")?.id
                                ) {
                                  return renderParty(party, index);
                                }
                                return null;
                              },
                            )}
                        </div>
                      </div>

                      {/* Pratibaadi Column */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                          <h4 className="font-semibold text-lg">
                            {t("formPratibaadiTitle")}
                          </h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              push({
                                partyName: "",
                                roleId:
                                  getParty("प्रतिवादी")?.id ||
                                  getParty("Pratibadi")?.id ||
                                  partyRoles[1]?.id ||
                                  "",
                                citizenshipNo: "",
                                permanentAddress: "",
                                temporaryAddress: "",
                                contactNo: "",
                                waris: null,
                              })
                            }
                          >
                            <PlusIcon className="mr-2 h-4 w-4" />{" "}
                            {t("addPratibaadiBtn")}
                          </Button>
                        </div>
                        <div className="space-y-4 flex flex-col">
                          {renderPratibaadi()}
                        </div>
                      </div>

                      {/* Other Parties */}
                      {renderOthers()}
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          push({
                            partyName: "",
                            roleId: "",
                            citizenshipNo: "",
                            permanentAddress: "",
                            temporaryAddress: "",
                            contactNo: "",
                            waris: null,
                          })
                        }
                      >
                        <PlusIcon className="mr-2 h-4 w-4" />{" "}
                        {t("addOtherPartyBtn")}
                      </Button>
                    </div>
                  </div>
                );
              }}
            </FieldArray>
          </div>

          <div className="space-y-4 border rounded-md p-4 bg-muted/20">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{t("formLawyers")}</h3>
            </div>
            <FieldArray name="lawyers">
              {({ insert, remove, push, form }) => (
                <div className="space-y-4">
                  {form.values.lawyers &&
                    form.values.lawyers.length > 0 &&
                    form.values.lawyers.map((lawyer: any, index: number) => (
                      <div
                        key={index}
                        className="space-y-4 border p-4 rounded-md bg-background relative"
                      >
                        <div className="flex justify-between items-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive h-8 w-8"
                            onClick={() => remove(index)}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                          <div className="space-y-2">
                            <Label>
                              {t("formLawyerSelect")}{" "}
                              <span className="text-destructive">*</span>
                            </Label>
                            <Field name={`lawyers.${index}.userId`}>
                              {({ field, form }: FieldProps) => (
                                <Select
                                  onValueChange={(val) =>
                                    form.setFieldValue(field.name, val)
                                  }
                                  value={field.value?.toString() || null}
                                >
                                  <SelectTrigger
                                    disabled={loadingLawyers}
                                    className="w-full"
                                  >
                                    <SelectValue
                                      placeholder={t("formLawyerSelect")}
                                    >
                                      {(() => {
                                        if (!field.value)
                                          return t("formLawyerSelect");
                                        const l = lawyerUsers.find(
                                          (x) => x.id === field.value,
                                        );
                                        if (!l) return t("formLawyerSelect");
                                        return `${l.first_name} ${l.last_name}`;
                                      })()}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {lawyerUsers.map((user) => (
                                      <SelectItem
                                        key={user.id}
                                        value={user.id.toString()}
                                      >
                                        {user.first_name} {user.last_name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </Field>
                            <ErrorMessage
                              name={`lawyers.${index}.userId`}
                              component="div"
                              className="text-sm text-destructive"
                            />
                          </div>
                          <div className="flex items-center space-x-2 pt-8">
                            <Field name={`lawyers.${index}.isLead`}>
                              {({ field, form }: FieldProps) => (
                                <Checkbox
                                  id={`lawyers.${index}.isLead`}
                                  checked={field.value}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      const updatedLawyers =
                                        form.values.lawyers.map(
                                          (l: any, i: number) => ({
                                            ...l,
                                            isLead: i === index,
                                          }),
                                        );
                                      form.setFieldValue(
                                        "lawyers",
                                        updatedLawyers,
                                      );
                                    } else {
                                      form.setFieldValue(field.name, checked);
                                    }
                                  }}
                                />
                              )}
                            </Field>
                            <Label htmlFor={`lawyers.${index}.isLead`}>
                              {t("formIsLead")}
                            </Label>
                          </div>
                        </div>
                      </div>
                    ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => push({ userId: "", isLead: false })}
                  >
                    <PlusIcon className="mr-2 h-4 w-4" /> {t("addLawyerBtn")}
                  </Button>
                </div>
              )}
            </FieldArray>
          </div>

          <div className="space-y-4 border rounded-md p-4 bg-muted/20">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">
                Related Precedents (Najir)
              </h3>
            </div>
            <FieldArray name="relatedPrecedents">
              {({ remove, push, form }) => (
                <div className="space-y-4">
                  {form.values.relatedPrecedents &&
                    form.values.relatedPrecedents.length > 0 &&
                    form.values.relatedPrecedents.map(
                      (precedent: any, index: number) => (
                        <div
                          key={index}
                          className="space-y-4 border p-4 rounded-md bg-background relative"
                        >
                          <div className="flex justify-between items-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive h-8 w-8"
                              onClick={() => remove(index)}
                            >
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                            <div className="space-y-2">
                              <Label>
                                Decision Number{" "}
                                <span className="text-destructive">*</span>
                              </Label>
                              <Field
                                name={`relatedPrecedents.${index}.decisionNumber`}
                              >
                                {({ field }: FieldProps) => (
                                  <Input {...field} placeholder="e.g. 10234" />
                                )}
                              </Field>
                              <ErrorMessage
                                name={`relatedPrecedents.${index}.decisionNumber`}
                                component="div"
                                className="text-sm text-destructive"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>
                                Parties{" "}
                                <span className="text-destructive">*</span>
                              </Label>
                              <Field
                                name={`relatedPrecedents.${index}.parties`}
                              >
                                {({ field }: FieldProps) => (
                                  <Input {...field} />
                                )}
                              </Field>
                              <ErrorMessage
                                name={`relatedPrecedents.${index}.parties`}
                                component="div"
                                className="text-sm text-destructive"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Year</Label>
                              <Field name={`relatedPrecedents.${index}.year`}>
                                {({ field }: FieldProps) => (
                                  <Input {...field} placeholder="e.g. 2080" />
                                )}
                              </Field>
                              <ErrorMessage
                                name={`relatedPrecedents.${index}.year`}
                                component="div"
                                className="text-sm text-destructive"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Sequence No</Label>
                              <Field
                                name={`relatedPrecedents.${index}.sequenceNo`}
                              >
                                {({ field }: FieldProps) => (
                                  <Input {...field} placeholder="e.g. 1" />
                                )}
                              </Field>
                              <ErrorMessage
                                name={`relatedPrecedents.${index}.sequenceNo`}
                                component="div"
                                className="text-sm text-destructive"
                              />
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() =>
                      push({
                        decisionNumber: "",
                        parties: "",
                        year: "",
                        sequenceNo: "",
                      })
                    }
                  >
                    <PlusIcon className="mr-2 h-4 w-4" /> Add Precedent
                  </Button>
                </div>
              )}
            </FieldArray>
          </div>

          <div className="space-y-2">
            <Label htmlFor="facts">{t("formFacts")}</Label>
            <Field name="facts">
              {({ field }: FieldProps) => (
                <Textarea
                  {...field}
                  id="facts"
                  placeholder="Brief description of the facts..."
                  className="min-h-25"
                />
              )}
            </Field>
            <ErrorMessage
              name="facts"
              component="div"
              className="text-sm text-destructive"
            />
          </div>

          <div className="bg-white flex justify-end gap-2 p-4 fixed bottom-0 left-0 right-0 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? t("submitUpdate") : t("submitAdd")}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
