const fs = require('fs');
const path = './frontend/app/[locale]/(admin)/dashboard/cases/CaseForm.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add PartyRole import
if (!content.includes('import { CaseData, PartyRole } from "@app/types";')) {
  content = content.replace('import { CaseData } from "@app/types";', 'import { CaseData, PartyRole } from "@app/types";');
}

// 2. We will extract the party card rendering into a helper function inside the FieldArray
// The FieldArray starts at: <FieldArray name="parties">
const fieldArrayStartIdx = content.indexOf('<FieldArray name="parties">');
const fieldArrayEndIdx = content.indexOf('</FieldArray>', fieldArrayStartIdx) + '</FieldArray>'.length;

const originalFieldArray = content.slice(fieldArrayStartIdx, fieldArrayEndIdx);

// The party form card starts at <div key={index} and ends at </div> (the wrapper of the party card)
const partyCardStartStr = '<div\n                          key={index}\n                          className="space-y-4 border p-4 rounded-md bg-background relative h-full flex flex-col justify-start"\n                        >';
const partyCardStartIdx = originalFieldArray.indexOf(partyCardStartStr);

// We know the end of the party card is just before:
const partyCardEndStr = '                        </div>\n                      ))}\n                  </div>\n                  <Button\n                    type="button"';
const partyCardEndIdx = originalFieldArray.indexOf('                        </div>\n                      ))}') + '                        </div>'.length;

const partyCard = originalFieldArray.slice(partyCardStartIdx, partyCardEndIdx);

const newFieldArray = `<FieldArray name="parties">
              {({ insert, remove, push, form }) => {
                const renderParty = (party: any, index: number) => (
                  ${partyCard.replace(/\n/g, '\n                  ')}
                );

                const renderBaadi = () => {
                  return form.values.parties && form.values.parties.map((party: any, index: number) => {
                    const role = partyRoles.find((r: any) => r.id === party.roleId);
                    if (role && (role.name === "वादी" || role.name === "Baadi" || role.name === "Plaintiff")) {
                      return renderParty(party, index);
                    }
                    return null;
                  });
                };

                const renderPratibaadi = () => {
                  return form.values.parties && form.values.parties.map((party: any, index: number) => {
                    const role = partyRoles.find((r: any) => r.id === party.roleId);
                    if (role && (role.name === "प्रतिवादी" || role.name === "Pratibadi" || role.name === "Defendant")) {
                      return renderParty(party, index);
                    }
                    return null;
                  });
                };

                const renderOthers = () => {
                  const hasOthers = form.values.parties && form.values.parties.filter((party: any) => {
                    const role = partyRoles.find((r: any) => r.id === party.roleId);
                    return !role || (role.name !== "वादी" && role.name !== "Baadi" && role.name !== "Plaintiff" && role.name !== "प्रतिवादी" && role.name !== "Pratibadi" && role.name !== "Defendant");
                  }).length > 0;

                  if (!hasOthers) return null;

                  return (
                    <div className="space-y-4 pt-6 border-t col-span-full">
                      <h4 className="font-semibold text-lg">{t("formOtherPartiesTitle", "Other Parties")}</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {form.values.parties.map((party: any, index: number) => {
                          const role = partyRoles.find((r: any) => r.id === party.roleId);
                          if (!role || (role.name !== "वादी" && role.name !== "Baadi" && role.name !== "Plaintiff" && role.name !== "प्रतिवादी" && role.name !== "Pratibadi" && role.name !== "Defendant")) {
                            return renderParty(party, index);
                          }
                          return null;
                        })}
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
                          <h4 className="font-semibold text-lg">{t("formBaadiTitle", "Baadi")}</h4>
                          <Button 
                            type="button" 
                            variant="outline"
                            size="sm"
                            onClick={() => push({
                                partyName: "",
                                roleId: checkParty("वादी")?.id || checkParty("Baadi")?.id || partyRoles[0]?.id || "",
                                citizenshipNo: "",
                                permanentAddress: "",
                                temporaryAddress: "",
                                contactNo: "",
                                waris: null,
                            })}
                          >
                            <PlusIcon className="mr-2 h-4 w-4" /> {t("addBaadiBtn", "Add Baadi")}
                          </Button>
                        </div>
                        <div className="space-y-4 flex flex-col">
                          {renderBaadi()}
                        </div>
                      </div>

                      {/* Pratibaadi Column */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                          <h4 className="font-semibold text-lg">{t("formPratibaadiTitle", "Pratibaadi")}</h4>
                          <Button 
                            type="button" 
                            variant="outline"
                            size="sm"
                            onClick={() => push({
                                partyName: "",
                                roleId: checkParty("प्रतिवादी")?.id || checkParty("Pratibadi")?.id || partyRoles[1]?.id || "",
                                citizenshipNo: "",
                                permanentAddress: "",
                                temporaryAddress: "",
                                contactNo: "",
                                waris: null,
                            })}
                          >
                            <PlusIcon className="mr-2 h-4 w-4" /> {t("addPratibaadiBtn", "Add Pratibaadi")}
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
                        <PlusIcon className="mr-2 h-4 w-4" /> {t("addOtherPartyBtn", "Add Other Party")}
                      </Button>
                    </div>
                  </div>
                );
              }}
            </FieldArray>`;

content = content.replace(originalFieldArray, newFieldArray);
fs.writeFileSync(path, content, 'utf8');
console.log('Successfully refactored CaseForm.tsx');
