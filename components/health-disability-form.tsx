"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Heart, Shield, AlertTriangle, Plus, Trash2 } from "lucide-react"
import { useTranslation } from "@/lib/translations"

interface HealthInsuranceInfo {
  memberId: string
  memberName: string
  hasInsurance: boolean
  provider?: string
  policyNumber?: string
  groupNumber?: string
  coverageType?: string
  monthlyPremium?: number
}

interface DisabilityInfo {
  hasDisabled: boolean
  needsLongTermCare: boolean
  hasIncarcerated: boolean
  disabilityDetails?: string
  longTermCareDetails?: string
  incarcerationDetails?: string
}

interface HealthDisabilityData {
  healthInsurance: HealthInsuranceInfo[]
  disabilities: DisabilityInfo
  pregnancyInfo: {
    isPregnant: boolean
    dueDate?: string
    memberName?: string
  }
  medicalConditions: {
    hasChronicConditions: boolean
    conditions?: string[]
    details?: string
  }
  medicalBills: {
    hasRecentBills: boolean
    billDetails?: string
  }
  needsNursingServices: string
}

interface HouseholdMember {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  socialSecurityNumber: string
  relationship: string
}

interface HealthDisabilityFormProps {
  data: HealthDisabilityData
  householdMembers: HouseholdMember[]
  applicantName: string
  benefitType: string
  onUpdate: (data: HealthDisabilityData) => void
}

const COMMON_CONDITIONS = [
  { value: "diabetes", label: "Diabetes" },
  { value: "highBloodPressure", label: "High Blood Pressure" },
  { value: "heartDisease", label: "Heart Disease" },
  { value: "asthma", label: "Asthma" },
  { value: "depressionAnxiety", label: "Depression/Anxiety" },
  { value: "arthritis", label: "Arthritis" },
  { value: "cancer", label: "Cancer" },
  { value: "kidneyDisease", label: "Kidney Disease" },
  { value: "mentalHealth", label: "Mental Health Conditions" },
  { value: "substanceAbuse", label: "Substance Abuse" },
  { value: "other", label: "Other" },
]

const INSURANCE_TYPES = [
  { value: "employer", label: "Employer" },
  { value: "marketplace", label: "Marketplace" },
  { value: "medicare", label: "Medicare" },
  { value: "medicaid", label: "Medicaid" },
  { value: "private", label: "Private" },
  { value: "cobra", label: "COBRA" },
  { value: "tricare", label: "TRICARE" },
  { value: "va", label: "VA Benefits" },
  { value: "other", label: "Other" },
]

export function HealthDisabilityForm({
  data,
  householdMembers,
  applicantName,
  benefitType,
  onUpdate,
}: HealthDisabilityFormProps) {
  const { t } = useTranslation()
  const [selectedConditions, setSelectedConditions] = useState<string[]>(data?.medicalConditions?.conditions || [])

  // Create list of all household members including applicant
  const allMembers = [
    {
      id: "applicant",
      firstName: applicantName.split(" ")[0] || t("householdQuestions.applicant"),
      lastName: applicantName.split(" ")[1] || "",
      relationship: "self",
    },
    ...householdMembers,
  ]

  const updateData = (updates: Partial<HealthDisabilityData>) => {
    onUpdate({ ...data, ...updates })
  }

  const addHealthInsurance = (memberId: string, memberName: string) => {
    const newInsurance: HealthInsuranceInfo = {
      memberId,
      memberName,
      hasInsurance: false,
      provider: "",
      policyNumber: "",
      groupNumber: "",
      coverageType: "",
      monthlyPremium: 0,
    }
    updateData({ healthInsurance: [...data.healthInsurance, newInsurance] })
  }

  const updateHealthInsurance = (index: number, updates: Partial<HealthInsuranceInfo>) => {
    const updatedInsurance = [...data.healthInsurance]
    updatedInsurance[index] = { ...updatedInsurance[index], ...updates }
    updateData({ healthInsurance: updatedInsurance })
  }

  const removeHealthInsurance = (index: number) => {
    updateData({ healthInsurance: data.healthInsurance.filter((_, i) => i !== index) })
  }

  const updateDisabilities = (updates: Partial<DisabilityInfo>) => {
    updateData({ disabilities: { ...data.disabilities, ...updates } })
  }

  const updatePregnancy = (updates: Partial<HealthDisabilityData["pregnancyInfo"]>) => {
    updateData({ pregnancyInfo: { ...data.pregnancyInfo, ...updates } })
  }

  const updateMedicalConditions = (updates: Partial<HealthDisabilityData["medicalConditions"]>) => {
    updateData({ medicalConditions: { ...data.medicalConditions, ...updates } })
  }

  const handleConditionChange = (conditionValue: string, checked: boolean) => {
    let newConditions: string[]
    if (checked) {
      newConditions = [...selectedConditions, conditionValue]
    } else {
      newConditions = selectedConditions.filter((c) => c !== conditionValue)
    }
    setSelectedConditions(newConditions)
    updateMedicalConditions({ conditions: newConditions })
  }

  const updateMedicalBills = (updates: Partial<HealthDisabilityData["medicalBills"]>) => {
    updateData({ medicalBills: { ...(data?.medicalBills || { hasRecentBills: false }), ...updates } })
  }

  const updateNursingServices = (value: string) => {
    updateData({ needsNursingServices: value })
  }

  const showNursingQuestion = benefitType === "medicaid" || benefitType === "both"

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Heart className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">{t("forms.healthDisability.title")}</h3>
        <p className="text-gray-600">{t("forms.healthDisability.subtitle")}</p>
      </div>

      {/* Health Insurance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t("forms.healthDisability.healthInsuranceSection")}
          </CardTitle>
          <CardDescription>{t("forms.healthDisability.healthInsuranceDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {allMembers.map((member) => {
            const memberInsurance = data.healthInsurance.find((ins) => ins.memberId === member.id)
            const memberName = `${member.firstName} ${member.lastName}`.trim()

            return (
              <div key={member.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">
                    {memberName}{" "}
                    {member.relationship === "self" ? t("forms.incomeEmployment.you") : `(${member.relationship})`}
                  </h4>
                  {!memberInsurance && (
                    <Button size="sm" onClick={() => addHealthInsurance(member.id, memberName)}>
                      <Plus className="w-4 h-4 mr-2" />
                      {t("forms.healthDisability.addInsurance")}
                    </Button>
                  )}
                </div>

                {memberInsurance && (
                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-4 flex-1">
                        <div className="space-y-3">
                          <Label>{t("forms.healthDisability.hasInsurance")} *</Label>
                          <RadioGroup
                            value={memberInsurance.hasInsurance ? "yes" : "no"}
                            onValueChange={(value) =>
                              updateHealthInsurance(data.healthInsurance.indexOf(memberInsurance), {
                                hasInsurance: value === "yes",
                              })
                            }
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id={`insurance-yes-${member.id}`} />
                              <Label htmlFor={`insurance-yes-${member.id}`}>{t("common.yes")}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id={`insurance-no-${member.id}`} />
                              <Label htmlFor={`insurance-no-${member.id}`}>{t("common.no")}</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {memberInsurance.hasInsurance && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>{t("forms.healthDisability.insuranceProvider")} *</Label>
                              <Input
                                value={memberInsurance.provider || ""}
                                onChange={(e) =>
                                  updateHealthInsurance(data.healthInsurance.indexOf(memberInsurance), {
                                    provider: e.target.value,
                                  })
                                }
                                placeholder={t("forms.healthDisability.insuranceProviderPlaceholder")}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>{t("forms.healthDisability.coverageType")}</Label>
                              <Select
                                value={memberInsurance.coverageType || ""}
                                onValueChange={(value) =>
                                  updateHealthInsurance(data.healthInsurance.indexOf(memberInsurance), {
                                    coverageType: value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={t("common.selectOption")} />
                                </SelectTrigger>
                                <SelectContent>
                                  {INSURANCE_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>{t("forms.healthDisability.policyNumber")}</Label>
                              <Input
                                value={memberInsurance.policyNumber || ""}
                                onChange={(e) =>
                                  updateHealthInsurance(data.healthInsurance.indexOf(memberInsurance), {
                                    policyNumber: e.target.value,
                                  })
                                }
                                placeholder={t("forms.healthDisability.policyNumberPlaceholder")}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>{t("forms.healthDisability.groupNumber")}</Label>
                              <Input
                                value={memberInsurance.groupNumber || ""}
                                onChange={(e) =>
                                  updateHealthInsurance(data.healthInsurance.indexOf(memberInsurance), {
                                    groupNumber: e.target.value,
                                  })
                                }
                                placeholder={t("forms.healthDisability.groupNumberPlaceholder")}
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label>{t("forms.healthDisability.monthlyPremium")} ($)</Label>
                              <Input
                                type="number"
                                value={memberInsurance.monthlyPremium || ""}
                                onChange={(e) =>
                                  updateHealthInsurance(data.healthInsurance.indexOf(memberInsurance), {
                                    monthlyPremium: Number.parseFloat(e.target.value) || 0,
                                  })
                                }
                                placeholder={t("forms.healthDisability.monthlyPremiumPlaceholder")}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeHealthInsurance(data.healthInsurance.indexOf(memberInsurance))}
                        className="ml-4 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {member.id !== allMembers[allMembers.length - 1].id && <Separator />}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Disability Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {t("forms.healthDisability.disabilitySection")}
          </CardTitle>
          <CardDescription>{t("forms.healthDisability.disabilityDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-base font-medium">{t("forms.healthDisability.hasDisability")} *</Label>
              <RadioGroup
                value={data.disabilities.hasDisabled ? "yes" : "no"}
                onValueChange={(value) => updateDisabilities({ hasDisabled: value === "yes" })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="disabled-yes" />
                  <Label htmlFor="disabled-yes">{t("common.yes")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="disabled-no" />
                  <Label htmlFor="disabled-no">{t("common.no")}</Label>
                </div>
              </RadioGroup>
              {data.disabilities.hasDisabled && (
                <div className="space-y-2">
                  <Label>{t("forms.healthDisability.disabilityDetails")}</Label>
                  <Textarea
                    value={data.disabilities.disabilityDetails || ""}
                    onChange={(e) => updateDisabilities({ disabilityDetails: e.target.value })}
                    placeholder={t("forms.healthDisability.disabilityDetailsPlaceholder")}
                    rows={3}
                  />
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-base font-medium">{t("forms.healthDisability.needsAssistance")} *</Label>
              <RadioGroup
                value={data.disabilities.needsLongTermCare ? "yes" : "no"}
                onValueChange={(value) => updateDisabilities({ needsLongTermCare: value === "yes" })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="longterm-yes" />
                  <Label htmlFor="longterm-yes">{t("common.yes")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="longterm-no" />
                  <Label htmlFor="longterm-no">{t("common.no")}</Label>
                </div>
              </RadioGroup>
              {data.disabilities.needsLongTermCare && (
                <div className="space-y-2">
                  <Label>{t("forms.healthDisability.assistanceDetails")}</Label>
                  <Textarea
                    value={data.disabilities.longTermCareDetails || ""}
                    onChange={(e) => updateDisabilities({ longTermCareDetails: e.target.value })}
                    placeholder={t("forms.healthDisability.assistanceDetailsPlaceholder")}
                    rows={3}
                  />
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-base font-medium">{t("forms.healthDisability.isIncarcerated")} *</Label>
              <RadioGroup
                value={data.disabilities.hasIncarcerated ? "yes" : "no"}
                onValueChange={(value) => updateDisabilities({ hasIncarcerated: value === "yes" })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="incarcerated-yes" />
                  <Label htmlFor="incarcerated-yes">{t("common.yes")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="incarcerated-no" />
                  <Label htmlFor="incarcerated-no">{t("common.no")}</Label>
                </div>
              </RadioGroup>
              {data.disabilities.hasIncarcerated && (
                <div className="space-y-2">
                  <Label>{t("forms.healthDisability.incarcerationDetails")}</Label>
                  <Textarea
                    value={data.disabilities.incarcerationDetails || ""}
                    onChange={(e) => updateDisabilities({ incarcerationDetails: e.target.value })}
                    placeholder={t("forms.healthDisability.incarcerationDetailsPlaceholder")}
                    rows={3}
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pregnancy Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t("forms.healthDisability.pregnancySection")}</CardTitle>
          <CardDescription>{t("forms.healthDisability.pregnancyDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-base font-medium">{t("forms.healthDisability.isPregnant")}</Label>
            <RadioGroup
              value={data.pregnancyInfo.isPregnant ? "yes" : "no"}
              onValueChange={(value) => updatePregnancy({ isPregnant: value === "yes" })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="pregnant-yes" />
                <Label htmlFor="pregnant-yes">{t("common.yes")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="pregnant-no" />
                <Label htmlFor="pregnant-no">{t("common.no")}</Label>
              </div>
            </RadioGroup>
            {data.pregnancyInfo.isPregnant && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("forms.healthDisability.whoIsPregnant")}</Label>
                  <Select
                    value={data.pregnancyInfo.memberName || ""}
                    onValueChange={(value) => updatePregnancy({ memberName: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("forms.healthDisability.selectHouseholdMember")} />
                    </SelectTrigger>
                    <SelectContent>
                      {allMembers.map((member) => (
                        <SelectItem key={member.id} value={`${member.firstName} ${member.lastName}`.trim()}>
                          {`${member.firstName} ${member.lastName}`.trim()}{" "}
                          {member.relationship === "self"
                            ? t("forms.incomeEmployment.you")
                            : `(${member.relationship})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("forms.healthDisability.dueDate")}</Label>
                  <Input
                    type="date"
                    value={data.pregnancyInfo.dueDate || ""}
                    onChange={(e) => updatePregnancy({ dueDate: e.target.value })}
                    placeholder={t("forms.healthDisability.dueDatePlaceholder")}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medical Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>{t("forms.healthDisability.medicalConditionsTitle")}</CardTitle>
          <CardDescription>{t("forms.healthDisability.medicalConditionsDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-base font-medium">{t("forms.healthDisability.hasChronicConditions")}</Label>
            <RadioGroup
              value={data.medicalConditions.hasChronicConditions ? "yes" : "no"}
              onValueChange={(value) => updateMedicalConditions({ hasChronicConditions: value === "yes" })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="conditions-yes" />
                <Label htmlFor="conditions-yes">{t("common.yes")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="conditions-no" />
                <Label htmlFor="conditions-no">{t("common.no")}</Label>
              </div>
            </RadioGroup>
            {data.medicalConditions.hasChronicConditions && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("forms.health.selectAllThatApply")}:</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {COMMON_CONDITIONS.map((condition) => (
                      <div key={condition.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`condition-${condition.value}`}
                          checked={selectedConditions.includes(condition.value)}
                          onCheckedChange={(checked) => handleConditionChange(condition.value, checked as boolean)}
                        />
                        <Label htmlFor={`condition-${condition.value}`} className="text-sm">
                          {condition.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>
                    {t("forms.healthDisability.additionalDetails")} ({t("common.optional")})
                  </Label>
                  <Textarea
                    value={data.medicalConditions.details || ""}
                    onChange={(e) => updateMedicalConditions({ details: e.target.value })}
                    placeholder={t("forms.healthDisability.additionalDetailsPlaceholder")}
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medical Bills & Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>{t("forms.healthDisability.medicalBillsTitle")}</CardTitle>
          <CardDescription>{t("forms.healthDisability.medicalBillsDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-base font-medium">{t("forms.healthDisability.hasRecentBills")} *</Label>
            <RadioGroup
              value={data?.medicalBills?.hasRecentBills ? "yes" : "no"}
              onValueChange={(value) => updateMedicalBills({ hasRecentBills: value === "yes" })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="bills-yes" />
                <Label htmlFor="bills-yes">{t("common.yes")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="bills-no" />
                <Label htmlFor="bills-no">{t("common.no")}</Label>
              </div>
            </RadioGroup>
            {data?.medicalBills?.hasRecentBills && (
              <div className="space-y-2">
                <Label>{t("forms.healthDisability.billDetails")}</Label>
                <Textarea
                  value={data?.medicalBills?.billDetails || ""}
                  onChange={(e) => updateMedicalBills({ billDetails: e.target.value })}
                  placeholder={t("forms.healthDisability.billDetailsPlaceholder")}
                  rows={4}
                />
                <p className="text-sm text-gray-600">{t("forms.healthDisability.billDetailsNote")}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Long-Term Care Services */}
      {showNursingQuestion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              {t("forms.healthDisability.longTermCareTitle")}
            </CardTitle>
            <CardDescription>{t("forms.healthDisability.longTermCareDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label className="text-base font-medium">{t("forms.healthDisability.needsNursingServices")} *</Label>
              <RadioGroup value={data.needsNursingServices} onValueChange={updateNursingServices} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="nursing_yes" />
                  <Label htmlFor="nursing_yes" className="font-normal cursor-pointer">
                    {t("forms.healthDisability.yesNursingServices")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="nursing_no" />
                  <Label htmlFor="nursing_no" className="font-normal cursor-pointer">
                    {t("forms.healthDisability.noNursingServices")}
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-sm text-gray-600">{t("forms.healthDisability.nursingServicesNote")}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
