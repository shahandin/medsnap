"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
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

const TAX_FILING_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "married_filing_jointly", label: "Married Filing Jointly" },
  { value: "married_filing_separately", label: "Married Filing Separately" },
  { value: "head_of_household", label: "Head of Household" },
  { value: "qualifying_widow", label: "Qualifying Widow(er)" },
]

const EMPLOYMENT_STATUS_OPTIONS = [
  { value: "employed_full_time", label: "Employed Full-Time" },
  { value: "employed_part_time", label: "Employed Part-Time" },
  { value: "self_employed", label: "Self-Employed" },
  { value: "unemployed", label: "Unemployed" },
  { value: "retired", label: "Retired" },
  { value: "disabled", label: "Disabled/Unable to Work" },
  { value: "student", label: "Student" },
  { value: "homemaker", label: "Homemaker" },
]

const INCOME_TYPES = [
  { value: "wages", label: "Wages/Salary (W-2)" },
  { value: "self_employment", label: "Self-Employment Income" },
  { value: "unemployment", label: "Unemployment Benefits" },
  { value: "social_security", label: "Social Security Benefits" },
  { value: "disability", label: "Disability Benefits" },
  { value: "retirement", label: "Retirement/Pension" },
  { value: "child_support", label: "Child Support" },
  { value: "alimony", label: "Alimony" },
  { value: "rental", label: "Rental Income" },
  { value: "investment", label: "Investment Income" },
  { value: "capital_gains", label: "Capital Gains" },
  { value: "dividends", label: "Dividends" },
  { value: "other", label: "Other Income" },
]

const EXPENSE_TYPES = [
  { value: "medical", label: "Medical/Dental Expenses" },
  { value: "childcare", label: "Childcare Expenses" },
  { value: "dependent_care", label: "Dependent Care" },
  { value: "student_loan", label: "Student Loan Interest" },
  { value: "alimony_paid", label: "Alimony Paid" },
  { value: "business", label: "Business Expenses" },
  { value: "other_deductible", label: "Other Tax Deductible" },
]

const HOUSING_EXPENSE_TYPES = [
  { value: "rent", label: "Rent" },
  { value: "mortgage", label: "Mortgage Payment" },
  { value: "property_tax", label: "Property Tax" },
  { value: "homeowners_insurance", label: "Homeowners/Renters Insurance" },
  { value: "utilities_electric", label: "Electric Bill" },
  { value: "utilities_gas", label: "Gas Bill" },
  { value: "utilities_water", label: "Water/Sewer Bill" },
  { value: "utilities_phone", label: "Phone Bill" },
  { value: "utilities_internet", label: "Internet Bill" },
  { value: "utilities_trash", label: "Trash/Recycling" },
  { value: "hoa_fees", label: "HOA Fees" },
  { value: "maintenance", label: "Home Maintenance/Repairs" },
]

const FREQUENCY_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "bi_weekly", label: "Bi-Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annually", label: "Annually" },
]

export function IncomeEmploymentForm({ data, onUpdate, householdMembers, applicantName }: IncomeEmploymentFormProps) {
  const [currentSubStep, setCurrentSubStep] = useState(0)
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(new Set())

  // Create list of all household members including applicant
  const allMembers = [
    {
      id: "applicant",
      firstName: applicantName.split(" ")[0] || "Applicant",
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
              <CardDescription>Select your tax filing status for the current year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="taxFilingStatus">Tax Filing Status *</Label>
                <Select value={data.taxFilingStatus} onValueChange={(value) => updateData({ taxFilingStatus: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your tax filing status" />
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
              <CardDescription>Employment status and details for all household members</CardDescription>
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
                            {memberName} {member.relationship === "self" ? "(You)" : `(${member.relationship})`}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {hasEmployment
                              ? `${memberEmployments.length} employment ${memberEmployments.length === 1 ? "entry" : "entries"}`
                              : "No employment information"}
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
                        {hasEmployment ? "Add Job" : "Add Employment"}
                      </Button>
                    </div>

                    {/* Member Content */}
                    {isExpanded && (
                      <div className="p-4 space-y-4 bg-background">
                        {memberEmployments.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>No employment information added yet</p>
                            <p className="text-sm mt-1">Click "Add Employment" above to get started</p>
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
                                        Job #{employmentIndex + 1}
                                      </h5>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeEmployment(globalIndex)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
                                    >
                                      <Trash2 className="w-4 h-4 mr-1" />
                                      Remove
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>Employment Status *</Label>
                                      <Select
                                        value={memberEmployment.status}
                                        onValueChange={(value) => updateEmployment(globalIndex, { status: value })}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select status" />
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
                                          <Label>Employer/Business Name</Label>
                                          <Input
                                            value={memberEmployment.employer || ""}
                                            onChange={(e) =>
                                              updateEmployment(globalIndex, {
                                                employer: e.target.value,
                                              })
                                            }
                                            placeholder="Enter employer name"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label>Job Title</Label>
                                          <Input
                                            value={memberEmployment.jobTitle || ""}
                                            onChange={(e) =>
                                              updateEmployment(globalIndex, {
                                                jobTitle: e.target.value,
                                              })
                                            }
                                            placeholder="Enter job title"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label>Monthly Income ($)</Label>
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
                                          <Label>Hours Per Week</Label>
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
              <CardDescription>All sources of income for household members</CardDescription>
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
                              {memberName} {member.relationship === "self" ? "(You)" : `(${member.relationship})`}
                            </div>
                            <div className="text-sm text-gray-500">
                              {memberIncome.length === 0
                                ? "No additional income sources"
                                : `${memberIncome.length} income source${memberIncome.length !== 1 ? "s" : ""}`}
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
                          {memberIncome.length === 0 ? "Add Income" : "Add More"}
                        </Button>
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0 space-y-4">
                        {memberIncome.length === 0 ? (
                          <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p>No additional income sources added yet</p>
                            <p className="text-sm">Click "Add Income" to get started</p>
                          </div>
                        ) : (
                          memberIncome.map((income, index) => (
                            <Card key={income.id} className="bg-gray-50 border-gray-200">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-4">
                                  <h5 className="font-medium text-gray-900">
                                    Income Source {memberIncome.length > 1 ? `#${index + 1}` : ""}
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
                                    <Label>Income Type *</Label>
                                    <Select
                                      value={income.type}
                                      onValueChange={(value) => updateIncome(income.id, { type: value })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
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
                                    <Label>Amount ($) *</Label>
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
                                    <Label>Frequency *</Label>
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
                                  <Label>Description (Optional)</Label>
                                  <Input
                                    value={income.description || ""}
                                    onChange={(e) => updateIncome(income.id, { description: e.target.value })}
                                    placeholder="Additional details about this income source"
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
                  Housing & Living Expenses
                </CardTitle>
                <CardDescription>Monthly housing costs and living expenses for your household</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Add your regular housing and utility expenses</p>
                  <Button size="sm" onClick={addHousingExpense}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Housing Expense
                  </Button>
                </div>

                {(data.housingExpenses || []).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p>No housing expenses added yet</p>
                    <p className="text-sm">Click "Add Housing Expense" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(data.housingExpenses || []).map((expense) => (
                      <div key={expense.id} className="border rounded-lg p-4 space-y-4 bg-muted/20">
                        <div className="flex justify-between items-start">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                            <div className="space-y-2">
                              <Label>Expense Type *</Label>
                              <Select
                                value={expense.type}
                                onValueChange={(value) => updateHousingExpense(expense.id, { type: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select expense type" />
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
                              <Label>Amount ($) *</Label>
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
                              <Label>Frequency *</Label>
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
                          <Label>Description (Optional)</Label>
                          <Input
                            value={expense.description || ""}
                            onChange={(e) => updateHousingExpense(expense.id, { description: e.target.value })}
                            placeholder="Additional details about this expense"
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
                  Tax Deductible Expenses
                </CardTitle>
                <CardDescription>Expenses that may reduce your taxable income</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {allMembers.map((member) => {
                  const memberExpenses = data.expenses.filter((exp) => exp.memberId === member.id)
                  const memberName = `${member.firstName} ${member.lastName}`.trim()

                  return (
                    <div key={member.id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">
                          {memberName} {member.relationship === "self" ? "(You)" : `(${member.relationship})`}
                        </h4>
                        <Button size="sm" onClick={() => addExpense(member.id, memberName)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Expense
                        </Button>
                      </div>

                      {memberExpenses.map((expense) => (
                        <div key={expense.id} className="border rounded-lg p-4 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                              <div className="space-y-2">
                                <Label>Expense Type *</Label>
                                <Select
                                  value={expense.type}
                                  onValueChange={(value) => updateExpense(expense.id, { type: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
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
                                <Label>Amount ($) *</Label>
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
                                <Label>Frequency *</Label>
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
                            <Label>Description (Optional)</Label>
                            <Input
                              value={expense.description || ""}
                              onChange={(e) => updateExpense(expense.id, { description: e.target.value })}
                              placeholder="Additional details about this expense"
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
    { id: "tax-filing", title: "Tax Filing Status", icon: Receipt },
    { id: "employment", title: "Employment Information", icon: Briefcase },
    { id: "income", title: "Additional Income", icon: TrendingUp },
    { id: "expenses", title: "Expenses", icon: Receipt },
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
          Step {currentSubStep + 1} of {subSteps.length}: {subSteps[currentSubStep].title}
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
          Previous
        </Button>

        {currentSubStep < subSteps.length - 1 ? (
          <Button onClick={handleNextSubStep} disabled={!canProceedToNextSubStep()} className="flex items-center gap-2">
            Continue
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <div className="text-sm text-gray-600 flex items-center">
            Click "Next" below to continue to Health & Disability
          </div>
        )}
      </div>
    </div>
  )
}
