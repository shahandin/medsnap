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

const INSURANCE_TYPES = [
  { value: "employer", label: "Employer-Sponsored" },
  { value: "marketplace", label: "Marketplace/ACA Plan" },
  { value: "medicare", label: "Medicare" },
  { value: "medicaid", label: "Medicaid" },
  { value: "private", label: "Private Insurance" },
  { value: "cobra", label: "COBRA" },
  { value: "tricare", label: "TRICARE" },
  { value: "va", label: "VA Benefits" },
  { value: "other", label: "Other" },
]

const COMMON_CONDITIONS = [
  "Diabetes",
  "High Blood Pressure",
  "Heart Disease",
  "Asthma",
  "Depression/Anxiety",
  "Arthritis",
  "Cancer",
  "Kidney Disease",
  "Mental Health Conditions",
  "Substance Abuse",
  "Other",
]

export function HealthDisabilityForm({
  data,
  householdMembers,
  applicantName,
  benefitType,
  onUpdate,
}: HealthDisabilityFormProps) {
  const [selectedConditions, setSelectedConditions] = useState<string[]>(data?.medicalConditions?.conditions || [])

  // Create list of all household members including applicant
  const allMembers = [
    {
      id: "applicant",
      firstName: applicantName.split(" ")[0] || "Applicant",
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

  const handleConditionChange = (condition: string, checked: boolean) => {
    let newConditions: string[]
    if (checked) {
      newConditions = [...selectedConditions, condition]
    } else {
      newConditions = selectedConditions.filter((c) => c !== condition)
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
        <h3 className="text-xl font-semibold mb-2">Health & Disability Information</h3>
        <p className="text-gray-600">
          Provide health insurance details and answer questions about disabilities and medical conditions.
        </p>
      </div>

      {/* Health Insurance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Health Insurance Information
          </CardTitle>
          <CardDescription>Current health insurance coverage for all household members</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {allMembers.map((member) => {
            const memberInsurance = data.healthInsurance.find((ins) => ins.memberId === member.id)
            const memberName = `${member.firstName} ${member.lastName}`.trim()

            return (
              <div key={member.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">
                    {memberName} {member.relationship === "self" ? "(You)" : `(${member.relationship})`}
                  </h4>
                  {!memberInsurance && (
                    <Button size="sm" onClick={() => addHealthInsurance(member.id, memberName)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Insurance Info
                    </Button>
                  )}
                </div>

                {memberInsurance && (
                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-4 flex-1">
                        <div className="space-y-3">
                          <Label>Do you have health insurance? *</Label>
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
                              <Label htmlFor={`insurance-yes-${member.id}`}>Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id={`insurance-no-${member.id}`} />
                              <Label htmlFor={`insurance-no-${member.id}`}>No</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {memberInsurance.hasInsurance && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Insurance Provider *</Label>
                              <Input
                                value={memberInsurance.provider || ""}
                                onChange={(e) =>
                                  updateHealthInsurance(data.healthInsurance.indexOf(memberInsurance), {
                                    provider: e.target.value,
                                  })
                                }
                                placeholder="e.g., Blue Cross Blue Shield"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Coverage Type</Label>
                              <Select
                                value={memberInsurance.coverageType || ""}
                                onValueChange={(value) =>
                                  updateHealthInsurance(data.healthInsurance.indexOf(memberInsurance), {
                                    coverageType: value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select coverage type" />
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
                              <Label>Policy Number</Label>
                              <Input
                                value={memberInsurance.policyNumber || ""}
                                onChange={(e) =>
                                  updateHealthInsurance(data.healthInsurance.indexOf(memberInsurance), {
                                    policyNumber: e.target.value,
                                  })
                                }
                                placeholder="Policy number"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Group Number</Label>
                              <Input
                                value={memberInsurance.groupNumber || ""}
                                onChange={(e) =>
                                  updateHealthInsurance(data.healthInsurance.indexOf(memberInsurance), {
                                    groupNumber: e.target.value,
                                  })
                                }
                                placeholder="Group number"
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label>Monthly Premium ($)</Label>
                              <Input
                                type="number"
                                value={memberInsurance.monthlyPremium || ""}
                                onChange={(e) =>
                                  updateHealthInsurance(data.healthInsurance.indexOf(memberInsurance), {
                                    monthlyPremium: Number.parseFloat(e.target.value) || 0,
                                  })
                                }
                                placeholder="0.00"
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
            Disability & Special Circumstances
          </CardTitle>
          <CardDescription>Answer these questions about household members</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-base font-medium">Is anyone in the household disabled? *</Label>
              <RadioGroup
                value={data.disabilities.hasDisabled ? "yes" : "no"}
                onValueChange={(value) => updateDisabilities({ hasDisabled: value === "yes" })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="disabled-yes" />
                  <Label htmlFor="disabled-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="disabled-no" />
                  <Label htmlFor="disabled-no">No</Label>
                </div>
              </RadioGroup>
              {data.disabilities.hasDisabled && (
                <div className="space-y-2">
                  <Label>Please provide details about the disability</Label>
                  <Textarea
                    value={data.disabilities.disabilityDetails || ""}
                    onChange={(e) => updateDisabilities({ disabilityDetails: e.target.value })}
                    placeholder="Describe the disability and how it affects daily activities..."
                    rows={3}
                  />
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-base font-medium">Is anyone in the household in need of long-term care? *</Label>
              <RadioGroup
                value={data.disabilities.needsLongTermCare ? "yes" : "no"}
                onValueChange={(value) => updateDisabilities({ needsLongTermCare: value === "yes" })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="longterm-yes" />
                  <Label htmlFor="longterm-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="longterm-no" />
                  <Label htmlFor="longterm-no">No</Label>
                </div>
              </RadioGroup>
              {data.disabilities.needsLongTermCare && (
                <div className="space-y-2">
                  <Label>Please provide details about long-term care needs</Label>
                  <Textarea
                    value={data.disabilities.longTermCareDetails || ""}
                    onChange={(e) => updateDisabilities({ longTermCareDetails: e.target.value })}
                    placeholder="Describe the long-term care needs..."
                    rows={3}
                  />
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-base font-medium">Is anyone in the household incarcerated? *</Label>
              <RadioGroup
                value={data.disabilities.hasIncarcerated ? "yes" : "no"}
                onValueChange={(value) => updateDisabilities({ hasIncarcerated: value === "yes" })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="incarcerated-yes" />
                  <Label htmlFor="incarcerated-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="incarcerated-no" />
                  <Label htmlFor="incarcerated-no">No</Label>
                </div>
              </RadioGroup>
              {data.disabilities.hasIncarcerated && (
                <div className="space-y-2">
                  <Label>Please provide details about incarceration</Label>
                  <Textarea
                    value={data.disabilities.incarcerationDetails || ""}
                    onChange={(e) => updateDisabilities({ incarcerationDetails: e.target.value })}
                    placeholder="Provide details about the incarceration status..."
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
          <CardTitle>Pregnancy Information</CardTitle>
          <CardDescription>Information about pregnancy in the household</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-base font-medium">Is anyone in the household pregnant?</Label>
            <RadioGroup
              value={data.pregnancyInfo.isPregnant ? "yes" : "no"}
              onValueChange={(value) => updatePregnancy({ isPregnant: value === "yes" })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="pregnant-yes" />
                <Label htmlFor="pregnant-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="pregnant-no" />
                <Label htmlFor="pregnant-no">No</Label>
              </div>
            </RadioGroup>
            {data.pregnancyInfo.isPregnant && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Who is pregnant?</Label>
                  <Select
                    value={data.pregnancyInfo.memberName || ""}
                    onValueChange={(value) => updatePregnancy({ memberName: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select household member" />
                    </SelectTrigger>
                    <SelectContent>
                      {allMembers.map((member) => (
                        <SelectItem key={member.id} value={`${member.firstName} ${member.lastName}`.trim()}>
                          {`${member.firstName} ${member.lastName}`.trim()}{" "}
                          {member.relationship === "self" ? "(You)" : `(${member.relationship})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Expected Due Date</Label>
                  <Input
                    type="date"
                    value={data.pregnancyInfo.dueDate || ""}
                    onChange={(e) => updatePregnancy({ dueDate: e.target.value })}
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
          <CardTitle>Medical Conditions</CardTitle>
          <CardDescription>Chronic conditions that may affect benefit eligibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-base font-medium">Does anyone have chronic medical conditions?</Label>
            <RadioGroup
              value={data.medicalConditions.hasChronicConditions ? "yes" : "no"}
              onValueChange={(value) => updateMedicalConditions({ hasChronicConditions: value === "yes" })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="conditions-yes" />
                <Label htmlFor="conditions-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="conditions-no" />
                <Label htmlFor="conditions-no">No</Label>
              </div>
            </RadioGroup>
            {data.medicalConditions.hasChronicConditions && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select all that apply:</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {COMMON_CONDITIONS.map((condition) => (
                      <div key={condition} className="flex items-center space-x-2">
                        <Checkbox
                          id={`condition-${condition}`}
                          checked={selectedConditions.includes(condition)}
                          onCheckedChange={(checked) => handleConditionChange(condition, checked as boolean)}
                        />
                        <Label htmlFor={`condition-${condition}`} className="text-sm">
                          {condition}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Additional details (optional)</Label>
                  <Textarea
                    value={data.medicalConditions.details || ""}
                    onChange={(e) => updateMedicalConditions({ details: e.target.value })}
                    placeholder="Provide any additional details about medical conditions..."
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
          <CardTitle>Medical Bills & Expenses</CardTitle>
          <CardDescription>Recent medical bills and expenses for household members</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Does anyone in the household have any paid or unpaid medical bills with a date of service from this month
              or within the past 3 months? *
            </Label>
            <RadioGroup
              value={data?.medicalBills?.hasRecentBills ? "yes" : "no"}
              onValueChange={(value) => updateMedicalBills({ hasRecentBills: value === "yes" })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="bills-yes" />
                <Label htmlFor="bills-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="bills-no" />
                <Label htmlFor="bills-no">No</Label>
              </div>
            </RadioGroup>
            {data?.medicalBills?.hasRecentBills && (
              <div className="space-y-2">
                <Label>Please provide details about the medical bills</Label>
                <Textarea
                  value={data?.medicalBills?.billDetails || ""}
                  onChange={(e) => updateMedicalBills({ billDetails: e.target.value })}
                  placeholder="Include details such as: provider name, approximate amount, date of service, whether paid or unpaid, and which household member the bill is for..."
                  rows={4}
                />
                <p className="text-sm text-gray-600">
                  Include information about hospital bills, doctor visits, prescription costs, dental work, or any other
                  medical expenses from the past 3 months.
                </p>
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
              Long-Term Care Services
            </CardTitle>
            <CardDescription>Information about nursing home or long-term care services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Are you applying for long-term nursing services from a nursing home or similar facility? *
              </Label>
              <RadioGroup value={data.needsNursingServices} onValueChange={updateNursingServices} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="nursing_yes" />
                  <Label htmlFor="nursing_yes" className="font-normal cursor-pointer">
                    Yes, I need long-term nursing services
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="nursing_no" />
                  <Label htmlFor="nursing_no" className="font-normal cursor-pointer">
                    No, I do not need long-term nursing services
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-sm text-gray-600">
                Long-term nursing services include care in nursing homes, assisted living facilities, or similar
                long-term care facilities.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
