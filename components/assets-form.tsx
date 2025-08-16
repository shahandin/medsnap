"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Trash2, DollarSign, Car, Shield } from "lucide-react"

interface Asset {
  id: string
  type: "financial" | "vehicle" | "life_insurance"
  owner: string
  details: {
    // Financial assets
    accountType?: string
    bankName?: string
    accountBalance?: string
    // Vehicle assets
    vehicleType?: string
    make?: string
    model?: string
    year?: string
    estimatedValue?: string
    // Life insurance
    policyType?: string
    insuranceCompany?: string
    faceValue?: string
    cashValue?: string
  }
}

interface AssetsFormProps {
  data: {
    assets: Asset[]
  }
  householdMembers: Array<{ id: string; firstName: string; lastName: string }>
  applicantName: string
  onUpdate: (data: { assets: Asset[] }) => void
}

export function AssetsForm({ data, householdMembers, applicantName, onUpdate }: AssetsFormProps) {
  const [assets, setAssets] = useState<Asset[]>(data.assets || [])

  const allMembers = [
    {
      id: "applicant",
      firstName: applicantName.split(" ")[0] || "Applicant",
      lastName: applicantName.split(" ")[1] || "",
    },
    ...householdMembers,
  ]

  const updateAssets = (newAssets: Asset[]) => {
    setAssets(newAssets)
    onUpdate({ assets: newAssets })
  }

  const addAsset = (type: Asset["type"]) => {
    const newAsset: Asset = {
      id: Date.now().toString(),
      type,
      owner: "",
      details: {},
    }
    updateAssets([...assets, newAsset])
  }

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    updateAssets(assets.map((asset) => (asset.id === id ? { ...asset, ...updates } : asset)))
  }

  const removeAsset = (id: string) => {
    updateAssets(assets.filter((asset) => asset.id !== id))
  }

  const renderAssetForm = (asset: Asset) => {
    const ownerName = allMembers.find((m) => m.id === asset.owner)
    const displayName = ownerName ? `${ownerName.firstName} ${ownerName.lastName}`.trim() : ""

    return (
      <Card key={asset.id} className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {asset.type === "financial" && <DollarSign className="h-5 w-5 text-green-600" />}
              {asset.type === "vehicle" && <Car className="h-5 w-5 text-blue-600" />}
              {asset.type === "life_insurance" && <Shield className="h-5 w-5 text-purple-600" />}
              <CardTitle className="text-lg">
                {asset.type === "financial" && "Financial Asset"}
                {asset.type === "vehicle" && "Vehicle"}
                {asset.type === "life_insurance" && "Life Insurance Policy"}
                {displayName && ` - ${displayName}`}
              </CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeAsset(asset.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor={`owner-${asset.id}`}>Asset Owner *</Label>
            <Select value={asset.owner} onValueChange={(value) => updateAsset(asset.id, { owner: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select who owns this asset" />
              </SelectTrigger>
              <SelectContent>
                {allMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {`${member.firstName} ${member.lastName}`.trim()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {asset.type === "financial" && (
            <>
              <div>
                <Label htmlFor={`account-type-${asset.id}`}>Account Type *</Label>
                <Select
                  value={asset.details.accountType || ""}
                  onValueChange={(value) =>
                    updateAsset(asset.id, { details: { ...asset.details, accountType: value } })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking Account</SelectItem>
                    <SelectItem value="savings">Savings Account</SelectItem>
                    <SelectItem value="money_market">Money Market Account</SelectItem>
                    <SelectItem value="cd">Certificate of Deposit (CD)</SelectItem>
                    <SelectItem value="investment">Investment Account</SelectItem>
                    <SelectItem value="cash">Cash on Hand</SelectItem>
                    <SelectItem value="other">Other Financial Asset</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor={`bank-name-${asset.id}`}>Bank/Institution Name</Label>
                <Input
                  id={`bank-name-${asset.id}`}
                  value={asset.details.bankName || ""}
                  onChange={(e) => updateAsset(asset.id, { details: { ...asset.details, bankName: e.target.value } })}
                  placeholder="Enter bank or institution name"
                />
              </div>
              <div>
                <Label htmlFor={`balance-${asset.id}`}>Current Balance *</Label>
                <Input
                  id={`balance-${asset.id}`}
                  type="number"
                  step="0.01"
                  value={asset.details.accountBalance || ""}
                  onChange={(e) =>
                    updateAsset(asset.id, { details: { ...asset.details, accountBalance: e.target.value } })
                  }
                  placeholder="0.00"
                />
              </div>
            </>
          )}

          {asset.type === "vehicle" && (
            <>
              <div>
                <Label htmlFor={`vehicle-type-${asset.id}`}>Vehicle Type *</Label>
                <Select
                  value={asset.details.vehicleType || ""}
                  onValueChange={(value) =>
                    updateAsset(asset.id, { details: { ...asset.details, vehicleType: value } })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="truck">Truck</SelectItem>
                    <SelectItem value="motorcycle">Motorcycle</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="rv">RV/Motorhome</SelectItem>
                    <SelectItem value="boat">Boat</SelectItem>
                    <SelectItem value="other">Other Vehicle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`make-${asset.id}`}>Make *</Label>
                  <Input
                    id={`make-${asset.id}`}
                    value={asset.details.make || ""}
                    onChange={(e) => updateAsset(asset.id, { details: { ...asset.details, make: e.target.value } })}
                    placeholder="e.g., Toyota"
                  />
                </div>
                <div>
                  <Label htmlFor={`model-${asset.id}`}>Model *</Label>
                  <Input
                    id={`model-${asset.id}`}
                    value={asset.details.model || ""}
                    onChange={(e) => updateAsset(asset.id, { details: { ...asset.details, model: e.target.value } })}
                    placeholder="e.g., Camry"
                  />
                </div>
                <div>
                  <Label htmlFor={`year-${asset.id}`}>Year *</Label>
                  <Input
                    id={`year-${asset.id}`}
                    type="number"
                    min="1900"
                    max="2025"
                    value={asset.details.year || ""}
                    onChange={(e) => updateAsset(asset.id, { details: { ...asset.details, year: e.target.value } })}
                    placeholder="2020"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor={`vehicle-value-${asset.id}`}>Estimated Current Value *</Label>
                <Input
                  id={`vehicle-value-${asset.id}`}
                  type="number"
                  step="0.01"
                  value={asset.details.estimatedValue || ""}
                  onChange={(e) =>
                    updateAsset(asset.id, { details: { ...asset.details, estimatedValue: e.target.value } })
                  }
                  placeholder="0.00"
                />
                <p className="text-sm text-gray-500 mt-1">
                  You can use resources like KBB or Edmunds to estimate value
                </p>
              </div>
            </>
          )}

          {asset.type === "life_insurance" && (
            <>
              <div>
                <Label htmlFor={`policy-type-${asset.id}`}>Policy Type *</Label>
                <Select
                  value={asset.details.policyType || ""}
                  onValueChange={(value) => updateAsset(asset.id, { details: { ...asset.details, policyType: value } })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select policy type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="term">Term Life Insurance</SelectItem>
                    <SelectItem value="whole">Whole Life Insurance</SelectItem>
                    <SelectItem value="universal">Universal Life Insurance</SelectItem>
                    <SelectItem value="variable">Variable Life Insurance</SelectItem>
                    <SelectItem value="other">Other Life Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor={`insurance-company-${asset.id}`}>Insurance Company *</Label>
                <Input
                  id={`insurance-company-${asset.id}`}
                  value={asset.details.insuranceCompany || ""}
                  onChange={(e) =>
                    updateAsset(asset.id, { details: { ...asset.details, insuranceCompany: e.target.value } })
                  }
                  placeholder="Enter insurance company name"
                />
              </div>
              <div>
                <Label htmlFor={`face-value-${asset.id}`}>Face Value (Death Benefit) *</Label>
                <Input
                  id={`face-value-${asset.id}`}
                  type="number"
                  step="0.01"
                  value={asset.details.faceValue || ""}
                  onChange={(e) => updateAsset(asset.id, { details: { ...asset.details, faceValue: e.target.value } })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor={`cash-value-${asset.id}`}>Cash Value</Label>
                <Input
                  id={`cash-value-${asset.id}`}
                  type="number"
                  step="0.01"
                  value={asset.details.cashValue || ""}
                  onChange={(e) => updateAsset(asset.id, { details: { ...asset.details, cashValue: e.target.value } })}
                  placeholder="0.00"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Leave blank if this is term life insurance or has no cash value
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Asset Information</h2>
        <p className="text-gray-600">
          Please provide information about assets owned by you or members of your household. This includes financial
          accounts, vehicles, and life insurance policies.
        </p>
      </div>

      {assets.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Current Assets</h3>
          {assets.map(renderAssetForm)}
        </div>
      )}

      <div className="space-y-4">
        <Separator />
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Asset</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => addAsset("financial")}
              className="h-20 flex flex-col items-center justify-center space-y-2 border-dashed border-2 hover:border-green-300 hover:bg-green-50"
            >
              <DollarSign className="h-6 w-6 text-green-600" />
              <span>Add Financial Asset</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => addAsset("vehicle")}
              className="h-20 flex flex-col items-center justify-center space-y-2 border-dashed border-2 hover:border-blue-300 hover:bg-blue-50"
            >
              <Car className="h-6 w-6 text-blue-600" />
              <span>Add Vehicle</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => addAsset("life_insurance")}
              className="h-20 flex flex-col items-center justify-center space-y-2 border-dashed border-2 hover:border-purple-300 hover:bg-purple-50"
            >
              <Shield className="h-6 w-6 text-purple-600" />
              <span>Add Life Insurance</span>
            </Button>
          </div>
        </div>
      </div>

      {assets.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No assets added yet. Click the buttons above to add your first asset.</p>
          <p className="text-sm text-gray-400">
            If you don't have any assets to report, you can proceed to the next section.
          </p>
        </div>
      )}
    </div>
  )
}
