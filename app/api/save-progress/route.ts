import { type NextRequest, NextResponse } from "next/server"
import { saveApplicationProgress } from "@/lib/actions"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const dataString = formData.get("data") as string
    const { applicationData, currentStep } = JSON.parse(dataString)

    await saveApplicationProgress(applicationData, currentStep)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving progress via beacon:", error)
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 })
  }
}
