import { streamText } from "ai"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { messages, image } = await req.json()
    const supabase = await createServerClient()

    // Get user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Get user's style preferences
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("style_type, favorite_colors, preferred_seasons, budget_range")
      .eq("user_id", user.id)
      .single()

    // Get user's wardrobe items
    const { data: wardrobeItems } = await supabase
      .from("wardrobe_items")
      .select("name, category, color, season, brand")
      .eq("user_id", user.id)
      .limit(20)

    // Build context for AI
    const wardrobeContext = wardrobeItems
      ? `Гардероб пользователя включает: ${wardrobeItems
          .map((item) => `${item.name} (${item.category}, ${item.color})`)
          .join(", ")}`
      : "Гардероб пользователя пока пуст."

    const styleContext = profile
      ? `Стиль: ${profile.style_type || "не указан"}, Любимые цвета: ${profile.favorite_colors?.join(", ") || "не указаны"}, Сезоны: ${profile.preferred_seasons?.join(", ") || "не указаны"}, Бюджет: ${profile.budget_range || "не указан"}`
      : "Предпочтения стиля не заданы."

    const systemPrompt = `Ты - профессиональный AI-стилист в приложении StylistAI. Твоя задача - помогать пользователям с выбором одежды, созданием образов и стилистическими советами.

Информация о пользователе:
${styleContext}
${wardrobeContext}

Твои принципы:
- Давай персонализированные советы на основе гардероба и предпочтений пользователя
- Будь дружелюбным, профессиональным и вдохновляющим
- Предлагай конкретные комбинации из гардероба пользователя
- Учитывай сезонность, цветовую гамму и стиль
- Отвечай на русском языке
- Если гардероб пуст, предлагай базовые вещи для начала
- Будь креативным, но практичным

Отвечай кратко и по делу, но с энтузиазмом!`

    // Stream AI response
    const result = await streamText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxTokens: 500,
    })

    // Save user message to database
    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role === "user") {
      await supabase.from("chat_messages").insert({
        user_id: user.id,
        role: "user",
        content: lastMessage.content,
        image_url: image || null,
      })
    }

    // We'll save the assistant's response after streaming completes
    // For now, return the stream
    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
