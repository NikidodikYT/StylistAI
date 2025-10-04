import { generateText } from "ai"
import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { image } = await req.json()
    const supabase = await createServerClient()

    // Get user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's style preferences for context
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("style_type, favorite_colors, preferred_seasons")
      .eq("user_id", user.id)
      .single()

    const styleContext = profile
      ? `Стиль пользователя: ${profile.style_type || "не указан"}, Любимые цвета: ${profile.favorite_colors?.join(", ") || "не указаны"}`
      : ""

    // Analyze photo with AI
    const { text } = await generateText({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "system",
          content: `Ты - профессиональный AI-стилист. Анализируй фотографии одежды и образов.

${styleContext}

Твоя задача:
1. Описать общий стиль и впечатление от фото
2. Определить конкретные вещи на фото (название, категория, цвет, сезон, стиль)
3. Дать 3-5 практических рекомендаций по стилю

Категории: tops, bottoms, dresses, outerwear, shoes, accessories
Сезоны: spring, summer, fall, winter, all-season

Отвечай ТОЛЬКО в формате JSON:
{
  "description": "общее описание образа",
  "items": [
    {
      "name": "название вещи",
      "category": "категория",
      "color": "#hex цвет",
      "season": "сезон",
      "style": "описание стиля"
    }
  ],
  "suggestions": ["совет 1", "совет 2", "совет 3"]
}`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Проанализируй эту одежду или образ:",
            },
            {
              type: "image",
              image: image,
            },
          ],
        },
      ],
      temperature: 0.7,
      maxTokens: 1000,
    })

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Invalid response format")
    }

    const analysis = JSON.parse(jsonMatch[0])
    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Photo analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
