"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useTranslation } from "@/contexts/translation-context"
import {
  Briefcase,
  Plus,
  Trash2,
  Receipt,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Check,
  ChevronDown,
  User,
} from "lucide-react"

interface EmploymentInfo {
  memberId: string
  memberName: string
  status: string
  employer?: string
  jobTitle?: string
  monthlyIncome?: number
  hoursPerWeek?: number
}

interface IncomeInfo {
  id: string
  memberId: string
  memberName: string
  type: string
  amount: number
  frequency: string
  description?: string
}

interface ExpenseInfo {
  id: string
  memberId: string
  memberName: string
  type: string
  amount: number
  frequency: string
  description?: string
}

interface HousingExpenseInfo {
  id: string
  type: string
  amount: number
  frequency: string
  description?: string
}

interface IncomeEmploymentData {
  taxFilingStatus: string
  employment: EmploymentInfo[]
  income: IncomeInfo[]
  expenses: ExpenseInfo[]
  housingExpenses: HousingExpenseInfo[]
}

interface HouseholdMember {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  socialSecurityNumber: string
  relationship: string
}

interface IncomeEmploymentFormProps {
  data: IncomeEmploymentData
  onUpdate: (updates: IncomeEmploymentData) => void
  householdMembers: HouseholdMember[]
  applicantName: string
}

export function IncomeEmploymentForm({ data, onUpdate, householdMembers, applicantName }: IncomeEmploymentFormProps) {
  const [currentSubStep, setCurrentSubStep] = useState(0)
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(new Set())
  const { t } = useTranslation()

  const TAX_FILING_OPTIONS = [
    { value: "single", label: t("formFields.single") },
    { value: "married_filing_jointly", label: t("formFields.marriedFilingJointly") },
    { value: "married_filing_separately", label: t("formFields.marriedFilingSeparately") },
    { value: "head_of_household", label: t("formFields.headOfHousehold") },
    { value: "qualifying_widow", label: t("formFields.qualifyingWidow") },
  ]

  const EMPLOYMENT_STATUS_OPTIONS = [
    { value: "employed_full_time", label: t("formFields.employedFullTime") },
    { value: "employed_part_time", label: t("forms.income.employmentStatuses.employed") + " " + t("common.partTime") },
    { value: "self_employed", label: t("forms.income.incomeTypes.selfEmployment") },
    { value: "unemployed", label: t("forms.income.employmentStatuses.unemployed") },
    { value: "retired", label: t("forms.income.employmentStatuses.retired") },
    { value: "disabled", label: t("forms.income.employmentStatuses.disabled") },
    { value: "student", label: t("forms.income.employmentStatuses.student") },
    { value: "homemaker", label: t("forms.income.employmentStatuses.homemaker") },
  ]

  const INCOME_TYPES = [
    { value: "wages", label: t("forms.income.incomeTypes.wages") },
    { value: "self_employment", label: t("forms.income.incomeTypes.selfEmployment") },
    { value: "unemployment", label: t("forms.income.incomeTypes.unemploymentBenefits") },
    { value: "social_security", label: t("forms.income.incomeTypes.socialSecurityBenefits") },
    { value: "disability", label: t("forms.income.incomeTypes.disabilityBenefits") },
    { value: "retirement", label: t("forms.income.incomeTypes.pension") },
    { value: "child_support", label: t("common.childSupport") },
    { value: "alimony", label: t("forms.income.incomeTypes.alimony") },
    { value: "rental", label: t("forms.income.incomeTypes.rentalIncome") },
    { value: "investment", label: t("forms.income.incomeTypes.investmentIncome") },
    { value: "capital_gains", label: t("forms.income.incomeTypes.capitalGains") },
    { value: "dividends", label: t("forms.income.incomeTypes.dividends") },
    { value: "other", label: t("forms.income.incomeTypes.other") },
  ]

  const EXPENSE_TYPES = [
    { value: "medical", label: t("forms.income.expenseTypes.medicalDental") },
    { value: "childcare", label: t("forms.income.expenseTypes.childcare") },
    { value: "dependent_care", label: t("forms.income.expenseTypes.dependentCare") },
    { value: "student_loan", label: t("common.studentLoan") },
    { value: "alimony_paid", label: t("forms.income.expenseTypes.alimonyPaid") },
    { value: "business", label: t("forms.income.expenseTypes.businessExpenses") },
    { value: "other_deductible", label: t("forms.income.expenseTypes.otherTaxDeductible") },
  ]

  const HOUSING_EXPENSE_TYPES = [
    { value: "rent", label: t("forms.income.expenseTypes.rent") },
    { value: "mortgage", label: t("forms.income.expenseTypes.mortgagePayment") },
    { value: "property_tax", label: t("forms.income.expenseTypes.propertyTax") },
    { value: "homeowners_insurance", label: t("forms.income.expenseTypes.homeownersInsurance") },
    { value: "utilities_electric", label: t("forms.income.expenseTypes.electricBill") },
    { value: "utilities_gas", label: t("forms.income.expenseTypes.gasBill") },
    { value: "utilities_water", label: t("forms.income.expenseTypes.waterSewerBill") },
    { value: "utilities_phone", label: t("forms.income.expenseTypes.phoneBill") },
    { value: "utilities_internet", label: t("forms.income.expenseTypes.internetBill") },
    { value: "utilities_trash", label: t("forms.income.expenseTypes.trashRecycling") },
    { value: "hoa_fees", label: t("forms.income.expenseTypes.hoaFees") },
    { value: "maintenance", label: t("forms.income.expenseTypes.homeMaintenanceRepairs") },
  ]

  const FREQUENCY_OPTIONS = [
    { value: "weekly", label: t("common.weekly") },
    { value: "bi_weekly", label: t("common.biWeekly") },
    { value: "monthly", label: t("formFields.monthly") },
    { value: "quarterly", label: t("common.quarterly") },
    { value: "annually", label: t("common.annually") },
  ]

  // Create list of all household members including applicant
  const allMembers = [
    {
      id: "applicant",
      firstName: applicantName.split(" ")[0] || t("common.applicant"),
      lastName: applicantName.split(" ").slice(1).join(" ") || "",
      relationship: "self",
    },
    ...householdMembers.filter((member) => member.relationship !== "self"),
  ]

  const updateData = (updates: Partial<IncomeEmploymentData>) => {
    onUpdate({ ...data, ...updates })
  }

  const addEmployment = (memberId: string, memberName: string) => {
    const newEmployment: EmploymentInfo = {
      memberId,
      memberName,
      status: "",
      employer: "",
      jobTitle: "",
      monthlyIncome: 0,
      hoursPerWeek: 0,
    }
    updateData({ employment: [...data.employment, newEmployment] })
  }

  const updateEmployment = (index: number, updates: Partial<EmploymentInfo>) => {
    const updatedEmployment = [...data.employment]
    updatedEmployment[index] = { ...updatedEmployment[index], ...updates }
    updateData({ employment: updatedEmployment })
  }

  const removeEmployment = (index: number) => {
    updateData({ employment: data.employment.filter((_, i) => i !== index) })
  }

  const addIncome = (memberId: string, memberName: string) => {
    const newIncome: IncomeInfo = {
      id: Date.now().toString(),
      memberId,
      memberName,
      type: "",
      amount: 0,
      frequency: "monthly",
      description: "",
    }
    updateData({ income: [...data.income, newIncome] })
  }

  const updateIncome = (id: string, updates: Partial<IncomeInfo>) => {
    const updatedIncome = data.income.map((item) => (item.id === id ? { ...item, ...updates } : item))
    updateData({ income: updatedIncome })
  }

  const removeIncome = (id: string) => {
    updateData({ income: data.income.filter((item) => item.id !== id) })
  }

  const addExpense = (memberId: string, memberName: string) => {
    const newExpense: ExpenseInfo = {
      id: Date.now().toString(),
      memberId,
      memberName,
      type: "",
      amount: 0,
      frequency: "monthly",
      description: "",
    }
    updateData({ expenses: [...data.expenses, newExpense] })
  }

  const updateExpense = (id: string, updates: Partial<ExpenseInfo>) => {
    const updatedExpenses = data.expenses.map((item) => (item.id === id ? { ...item, ...updates } : item))
    updateData({ expenses: updatedExpenses })
  }

  const removeExpense = (id: string) => {
    updateData({ expenses: data.expenses.filter((item) => item.id !== id) })
  }

  const addHousingExpense = () => {
    const newExpense: HousingExpenseInfo = {
      id: Date.now().toString(),
      type: "",
      amount: 0,
      frequency: "monthly",
      description: "",
    }
    updateData({ housingExpenses: [...(data.housingExpenses || []), newExpense] })
  }

  const updateHousingExpense = (id: string, updates: Partial<HousingExpenseInfo>) => {
    const updatedExpenses = (data.housingExpenses || []).map((item) =>
      item.id === id ? { ...item, ...updates } : item,
    )
    updateData({ housingExpenses: updatedExpenses })
  }

  const removeHousingExpense = (id: string) => {
    updateData({ housingExpenses: (data.housingExpenses || []).filter((item) => item.id !== id) })
  }

  const canProceedToNextSubStep = () => {
    switch (currentSubStep) {
      case 0: // Tax Filing
        return data.taxFilingStatus !== ""
      case 1: // Employment
        return true // Employment can be optional
      case 2: // Income
        return true // Additional income can be optional
      case 3: // Expenses
        return true // Expenses can be optional
      default:
        return true
    }
  }

  const handleNextSubStep = () => {
    if (currentSubStep < subSteps.length - 1) {
      setCurrentSubStep(currentSubStep + 1)
    }
  }

  const handlePreviousSubStep = () => {
    if (currentSubStep > 0) {
      setCurrentSubStep(currentSubStep - 1)
    }
  }

  const toggleMemberExpansion = (memberId: string) => {
    const newExpanded = new Set(expandedMembers)
    if (newExpanded.has(memberId)) {
      newExpanded.delete(memberId)
    } else {
      newExpanded.add(memberId)
    }
    setExpandedMembers(newExpanded)
  }

  const renderCurrentSubStep = () => {
    const currentStep = subSteps[currentSubStep]
    const StepIcon = currentStep.icon

    switch (currentSubStep) {
      case 0: // Tax Filing
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StepIcon className="w-5 h-5" />
                {currentStep.title}
              </CardTitle>
              <CardDescription>{t("forms.income.selectTaxFilingStatus")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="taxFilingStatus">{t("forms.income.taxFilingStatus")} *</Label>
                <Select value={data.taxFilingStatus} onValueChange={(value) => updateData({ taxFilingStatus: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("forms.income.selectTaxFilingStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    {TAX_FILING_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )

      case 1: // Employment
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StepIcon className="w-5 h-5" />
                {currentStep.title}
              </CardTitle>
              <CardDescription>{t("forms.income.employmentInformation")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {allMembers.map((member) => {
                const memberEmployments = data.employment.filter((emp) => emp.memberId === member.id)
                const memberName = `${member.firstName} ${member.lastName}`.trim()
                const isExpanded = expandedMembers.has(member.id)
                const hasEmployment = memberEmployments.length > 0

                return (
                  <div key={member.id} className="border rounded-lg overflow-hidden">
                    {/* Member Header */}
                    <div
                      className="flex items-center justify-between p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleMemberExpansion(member.id)}
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                        <div>
                          <h4 className="font-medium text-base">
                            {memberName}{" "}
                            {member.relationship === "self" ? `(${t("common.you")})` : `(${member.relationship})`}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {hasEmployment
                              ? `${memberEmployments.length} ${t("forms.income.currentJobs")}`
                              : t("forms.income.noEmploymentInformation")}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          addEmployment(member.id, memberName)
                          if (!isExpanded) {
                            toggleMemberExpansion(member.id)
                          }
                        }}
                        className="shrink-0"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {hasEmployment ? t("forms.income.addJob") : t("forms.income.addEmployment")}
                      </Button>
                    </div>

                    {/* Member Content */}
                    {isExpanded && (
                      <div className="p-4 space-y-4 bg-background">
                        {memberEmployments.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>{t("forms.income.noEmploymentInformation")}</p>
                            <p className="text-sm mt-1">{t("forms.income.clickAddEmploymentToStart")}</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {memberEmployments.map((memberEmployment, employmentIndex) => {
                              const globalIndex = data.employment.indexOf(memberEmployment)
                              return (
                                <div key={globalIndex} className="bg-muted/20 rounded-lg p-4 space-y-4">
                                  <div className="flex justify-between items-center">
                                    {memberEmployments.length > 1 && (
                                      <h5 className="font-medium text-sm text-muted-foreground">
                                        {t("common.job")} #{employmentIndex + 1}
                                      </h5>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeEmployment(globalIndex)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
                                    >
                                      <Trash2 className="w-4 h-4 mr-1" />
                                      {t("common.remove")}
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>{t("forms.income.employmentStatus")} *</Label>
                                      <Select
                                        value={memberEmployment.status}
                                        onValueChange={(value) => updateEmployment(globalIndex, { status: value })}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder={t("forms.income.selectStatus")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {EMPLOYMENT_STATUS_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                              {option.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {(memberEmployment.status === "employed_full_time" ||
                                      memberEmployment.status === "employed_part_time" ||
                                      memberEmployment.status === "self_employed") && (
                                      <>
                                        <div className="space-y-2">
                                          <Label>{t("formFields.employerBusinessName")}</Label>
                                          <Input
                                            value={memberEmployment.employer || ""}
                                            onChange={(e) =>
                                              updateEmployment(globalIndex, {
                                                employer: e.target.value,
                                              })
                                            }
                                            placeholder={t("formFields.enterEmployerName")}
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label>{t("formFields.jobTitle")}</Label>
                                          <Input
                                            value={memberEmployment.jobTitle || ""}
                                            onChange={(e) =>
                                              updateEmployment(globalIndex, {
                                                jobTitle: e.target.value,
                                              })
                                            }
                                            placeholder={t("formFields.enterJobTitle")}
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label>{t("formFields.monthlyIncome")} ($)</Label>
                                          <Input
                                            type="number"
                                            value={memberEmployment.monthlyIncome || ""}
                                            onChange={(e) =>
                                              updateEmployment(globalIndex, {
                                                monthlyIncome: Number.parseFloat(e.target.value) || 0,
                                              })
                                            }
                                            placeholder="0.00"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label>{t("formFields.hoursPerWeek")}</Label>
                                          <Input
                                            type="number"
                                            value={memberEmployment.hoursPerWeek || ""}
                                            onChange={(e) =>
                                              updateEmployment(globalIndex, {
                                                hoursPerWeek: Number.parseFloat(e.target.value) || 0,
                                              })
                                            }
                                            placeholder="40"
                                          />
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )

      case 2: // Additional Income
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StepIcon className="w-5 h-5" />
                {currentStep.title}
              </CardTitle>
              <CardDescription>{t("forms.income.otherIncomeInformation")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {allMembers.map((member) => {
                const memberIncome = data.income.filter((inc) => inc.memberId === member.id)
                const memberName = `${member.firstName} ${member.lastName}`.trim()
                const isExpanded = expandedMembers.has(`income-${member.id}`)

                return (
                  <Card key={member.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            const newExpanded = new Set(expandedMembers)
                            if (isExpanded) {
                              newExpanded.delete(`income-${member.id}`)
                            } else {
                              newExpanded.add(`income-${member.id}`)
                            }
                            setExpandedMembers(newExpanded)
                          }}
                          className="flex items-center gap-3 text-left hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors flex-1"
                        >
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {memberName}{" "}
                              {member.relationship === "self" ? `(${t("common.you")})` : `(${member.relationship})`}
                            </div>
                            <div className="text-sm text-gray-500">
                              {memberIncome.length === 0
                                ? t("forms.income.noAdditionalIncomeSources")
                                : `${memberIncome.length} ${t("forms.income.incomeSource")}${memberIncome.length !== 1 ? "s" : ""}`}
                            </div>
                          </div>
                        </button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addIncome(member.id, memberName)}
                          className="ml-2"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          {memberIncome.length === 0 ? t("forms.income.addIncome") : t("forms.income.addMore")}
                        </Button>
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0 space-y-4">
                        {memberIncome.length === 0 ? (
                          <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p>{t("forms.income.noAdditionalIncomeSourcesAdded")}</p>
                            <p className="text-sm">{t("forms.income.clickAddIncomeToStart")}</p>
                          </div>
                        ) : (
                          memberIncome.map((income, index) => (
                            <Card key={income.id} className="bg-gray-50 border-gray-200">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-4">
                                  <h5 className="font-medium text-gray-900">
                                    {t("forms.income.currentIncomeSource")}{" "}
                                    {memberIncome.length > 1 ? `#${index + 1}` : ""}
                                  </h5>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeIncome(income.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 -mt-2 -mr-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                  <div className="space-y-2">
                                    <Label>{t("formFields.incomeType")} *</Label>
                                    <Select
                                      value={income.type}
                                      onValueChange={(value) => updateIncome(income.id, { type: value })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder={t("formFields.selectType")} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {INCOME_TYPES.map((option) => (
                                          <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>{t("formFields.amount")} *</Label>
                                    <Input
                                      type="number"
                                      value={income.amount || ""}
                                      onChange={(e) =>
                                        updateIncome(income.id, { amount: Number.parseFloat(e.target.value) || 0 })
                                      }
                                      placeholder="0.00"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>{t("formFields.frequency")} *</Label>
                                    <Select
                                      value={income.frequency}
                                      onValueChange={(value) => updateIncome(income.id, { frequency: value })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {FREQUENCY_OPTIONS.map((option) => (
                                          <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label>{t("formFields.description")}</Label>
                                  <Input
                                    value={income.description || ""}
                                    onChange={(e) => updateIncome(income.id, { description: e.target.value })}
                                    placeholder={t("formFields.additionalDetails")}
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </CardContent>
          </Card>
        )

      case 3: // Expenses
        return (
          <div className="space-y-6">
            {/* Housing & Living Expenses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  {t("formFields.housingLivingExpenses")}
                </CardTitle>
                <CardDescription>{t("formFields.monthlyHousingCosts")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">{t("formFields.addRegularExpenses")}</p>
                  <Button size="sm" onClick={addHousingExpense}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t("formFields.addHousingExpense")}
                  </Button>
                </div>

                {(data.housingExpenses || []).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p>{t("formFields.noHousingExpensesAdded")}</p>
                    <p className="text-sm">{t("formFields.clickAddHousingExpense")}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(data.housingExpenses || []).map((expense) => (
                      <div key={expense.id} className="border rounded-lg p-4 space-y-4 bg-muted/20">
                        <div className="flex justify-between items-start">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                            <div className="space-y-2">
                              <Label>{t("common.expenseType")} *</Label>
                              <Select
                                value={expense.type}
                                onValueChange={(value) => updateHousingExpense(expense.id, { type: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={t("forms.income.selectExpenseType")} />
                                </SelectTrigger>
                                <SelectContent>
                                  {HOUSING_EXPENSE_TYPES.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>{t("formFields.amount")} *</Label>
                              <Input
                                type="number"
                                value={expense.amount || ""}
                                onChange={(e) =>
                                  updateHousingExpense(expense.id, {
                                    amount: Number.parseFloat(e.target.value) || 0,
                                  })
                                }
                                placeholder="0.00"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>{t("formFields.frequency")} *</Label>
                              <Select
                                value={expense.frequency}
                                onValueChange={(value) => updateHousingExpense(expense.id, { frequency: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {FREQUENCY_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeHousingExpense(expense.id)}
                            className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Label>{t("formFields.description")}</Label>
                          <Input
                            value={expense.description || ""}
                            onChange={(e) => updateHousingExpense(expense.id, { description: e.target.value })}
                            placeholder={t("forms.income.additionalExpenseDetails")}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tax Deductible Expenses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StepIcon className="w-5 h-5" />
                  {t("formFields.taxDeductibleExpenses")}
                </CardTitle>
                <CardDescription>{t("formFields.expensesThatReduce")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {allMembers.map((member) => {
                  const memberExpenses = data.expenses.filter((exp) => exp.memberId === member.id)
                  const memberName = `${member.firstName} ${member.lastName}`.trim()

                  return (
                    <div key={member.id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">
                          {memberName}{" "}
                          {member.relationship === "self" ? `(${t("common.you")})` : `(${member.relationship})`}
                        </h4>
                        <Button size="sm" onClick={() => addExpense(member.id, memberName)}>
                          <Plus className="w-4 h-4 mr-2" />
                          {t("formFields.addExpense")}
                        </Button>
                      </div>

                      {memberExpenses.map((expense) => (
                        <div key={expense.id} className="border rounded-lg p-4 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                              <div className="space-y-2">
                                <Label>{t("common.expenseType")} *</Label>
                                <Select
                                  value={expense.type}
                                  onValueChange={(value) => updateExpense(expense.id, { type: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={t("formFields.selectType")} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {EXPENSE_TYPES.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>{t("formFields.amount")} *</Label>
                                <Input
                                  type="number"
                                  value={expense.amount || ""}
                                  onChange={(e) =>
                                    updateExpense(expense.id, { amount: Number.parseFloat(e.target.value) || 0 })
                                  }
                                  placeholder="0.00"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>{t("formFields.frequency")} *</Label>
                                <Select
                                  value={expense.frequency}
                                  onValueChange={(value) => updateExpense(expense.id, { frequency: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {FREQUENCY_OPTIONS.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeExpense(expense.id)}
                              className="ml-4 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <Label>{t("formFields.description")}</Label>
                            <Input
                              value={expense.description || ""}
                              onChange={(e) => updateExpense(expense.id, { description: e.target.value })}
                              placeholder={t("forms.income.additionalExpenseDetails")}
                            />
                          </div>
                        </div>
                      ))}

                      {member.id !== allMembers[allMembers.length - 1].id && <Separator />}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  const subSteps = [
    { id: "tax-filing", title: t("stepNavigation.taxFilingStatus"), icon: Receipt },
    { id: "employment", title: t("stepNavigation.employmentInformation"), icon: Briefcase },
    { id: "income", title: t("stepNavigation.additionalIncome"), icon: TrendingUp },
    { id: "expenses", title: t("stepNavigation.expenses"), icon: Receipt },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          {subSteps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  index === currentSubStep
                    ? "bg-blue-600 text-white"
                    : index < currentSubStep
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-600"
                }`}
              >
                {index < currentSubStep ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              {index < subSteps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${index < currentSubStep ? "bg-green-600" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-600">
          {t("stepNavigation.stepOf", { variables: { current: currentSubStep + 1, total: subSteps.length } })}:{" "}
          {subSteps[currentSubStep].title}
        </div>
      </div>

      {renderCurrentSubStep()}

      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={handlePreviousSubStep}
          disabled={currentSubStep === 0}
          className="flex items-center gap-2 bg-transparent"
        >
          <ChevronLeft className="w-4 h-4" />
          {t("common.previous")}
        </Button>

        {currentSubStep < subSteps.length - 1 ? (
          <Button onClick={handleNextSubStep} disabled={!canProceedToNextSubStep()} className="flex items-center gap-2">
            {t("common.continue")}
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <div className="text-sm text-gray-600 flex items-center">
            {t("common.clickNextToContinue")} {t("stepNavigation.healthAndDisability")}
          </div>
        )}
      </div>
    </div>
  )
}
