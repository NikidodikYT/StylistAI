"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Wand2, RefreshCw, Heart, Share2 } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"

export function OutfitGenerator() {
  const [generating, setGenerating] = useState(false)
  const [outfit, setOutfit] = useState<any>(null)
  const [season, setSeason] = useState("")
  const [event, setEvent] = useState("")
  const [style, setStyle] = useState("")
  const [saved, setSaved] = useState(false)

  const handleGenerate = async () => {
    if (!season || !event || !style) return

    setGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setOutfit({
      name: "Sophisticated Evening Look",
      items: [
        {
          type: "Top",
          name: "Silk Blouse",
          color: "#2C3E50",
          description: "Elegant navy silk blouse with subtle sheen",
        },
        { type: "Bottom", name: "Tailored Trousers", color: "#34495E", description: "High-waisted charcoal trousers" },
        { type: "Shoes", name: "Pointed Heels", color: "#000000", description: "Classic black pointed-toe heels" },
        {
          type: "Accessory",
          name: "Statement Earrings",
          color: "#C0C0C0",
          description: "Silver geometric drop earrings",
        },
        { type: "Bag", name: "Clutch", color: "#2C3E50", description: "Navy leather clutch with gold hardware" },
      ],
      occasion: event,
      season: season,
      styleNotes:
        "This outfit balances sophistication with modern elegance. The monochromatic color scheme creates a cohesive look while the statement earrings add personality.",
    })
    setSaved(false)
    setGenerating(false)
  }

  const handleSave = () => {
    setSaved(true)
    toast.success("Outfit saved to your collection!")
  }

  const handleShare = () => {
    toast.success("Outfit link copied to clipboard!")
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Generator Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Your Outfit</CardTitle>
          <CardDescription>Select your preferences and let AI create the perfect outfit</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="season">Season</Label>
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger id="season">
                <SelectValue placeholder="Select season" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spring">Spring</SelectItem>
                <SelectItem value="summer">Summer</SelectItem>
                <SelectItem value="fall">Fall</SelectItem>
                <SelectItem value="winter">Winter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event">Event Type</Label>
            <Select value={event} onValueChange={setEvent}>
              <SelectTrigger id="event">
                <SelectValue placeholder="Select event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casual-day">Casual Day Out</SelectItem>
                <SelectItem value="work">Work/Office</SelectItem>
                <SelectItem value="date-night">Date Night</SelectItem>
                <SelectItem value="formal">Formal Event</SelectItem>
                <SelectItem value="party">Party/Celebration</SelectItem>
                <SelectItem value="weekend">Weekend Brunch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="style">Style Preference</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger id="style">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classic">Classic</SelectItem>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="bohemian">Bohemian</SelectItem>
                <SelectItem value="edgy">Edgy</SelectItem>
                <SelectItem value="romantic">Romantic</SelectItem>
                <SelectItem value="minimalist">Minimalist</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={!season || !event || !style || generating}
              className="flex-1"
              size="lg"
            >
              {generating ? (
                <>
                  <Spinner className="mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 w-4 h-4" />
                  Generate Outfit
                </>
              )}
            </Button>
            {outfit && (
              <Button onClick={handleGenerate} variant="outline" size="lg" disabled={generating}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Outfit Display */}
      <Card className={outfit ? "border-primary/50" : ""}>
        <CardHeader>
          <CardTitle>Your Generated Outfit</CardTitle>
          <CardDescription>
            {outfit ? "AI-curated outfit based on your selections" : "Your outfit will appear here"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {outfit ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">{outfit.name}</h3>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary">{outfit.season}</Badge>
                  <Badge variant="secondary">{outfit.occasion}</Badge>
                </div>
              </div>

              <div className="space-y-3">
                {outfit.items.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div
                      className="w-12 h-12 rounded-md border-2 border-border flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                        <span className="font-semibold text-sm">{item.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-2 text-sm">Style Notes</h4>
                <p className="text-sm text-muted-foreground">{outfit.styleNotes}</p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} variant="outline" className="flex-1 bg-transparent" disabled={saved}>
                  <Heart className={`mr-2 w-4 h-4 ${saved ? "fill-current" : ""}`} />
                  {saved ? "Saved" : "Save"}
                </Button>
                <Button onClick={handleShare} variant="outline" className="flex-1 bg-transparent">
                  <Share2 className="mr-2 w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Wand2 className="w-12 h-12 mb-4 opacity-50" />
              <p>Your AI-generated outfit will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
