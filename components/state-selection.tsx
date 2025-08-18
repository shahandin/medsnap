"use client"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "DC", name: "District of Columbia" },
]

interface StateSelectionProps {
  selectedState: string
  onStateSelect: (state: string) => void
}

export function StateSelection({ selectedState, onStateSelect }: StateSelectionProps) {
  const selectedStateName = US_STATES.find((state) => state.code === selectedState)?.name

  return (
    <div className="space-y-6">
      <div className="text-center">
        <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Select Your State</h3>
        <p className="text-gray-600">
          Choose the state where you reside and are applying for benefits. Each state has different requirements and
          processes.
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <Label htmlFor="state-selector" className="text-sm font-medium mb-2 block">
          State of Residence
        </Label>
        <Select value={selectedState} onValueChange={onStateSelect}>
          <SelectTrigger className="w-full h-12 text-left font-normal bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
            <SelectValue placeholder="Select a state...">
              {selectedState ? (
                <span className="flex items-center">
                  <span className="font-medium">{selectedStateName}</span>
                  <span className="ml-2 text-sm text-gray-500">({selectedState})</span>
                </span>
              ) : (
                <span className="text-gray-500">Select a state...</span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {US_STATES.map((state) => (
              <SelectItem key={state.code} value={state.code} className="py-3">
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">{state.name}</span>
                  <span className="ml-2 text-sm text-gray-500">({state.code})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedState && (
        <div className="text-center">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            Selected: {selectedStateName} ({selectedState})
          </Badge>
        </div>
      )}
    </div>
  )
}
