import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Simulate async database query
    await new Promise((resolve) => setTimeout(resolve, 500))

    const data = {
      outfits: [
        { id: "1", name: "Summer Look", style: "Casual" },
        { id: "2", name: "Business Attire", style: "Formal" },
      ],
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("[v0] API Error:", error)
    return NextResponse.json({ error: "Failed to fetch outfits" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    if (!body.name || !body.style) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Simulate async database insert
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newOutfit = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(newOutfit, { status: 201 })
  } catch (error) {
    console.error("[v0] API Error:", error)
    return NextResponse.json({ error: "Failed to create outfit" }, { status: 500 })
  }
}
