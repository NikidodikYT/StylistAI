"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Palette, Copy, Check } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"

export function ColorPalette() {
  const [generating, setGenerating] = useState(false)
  const [palette, setPalette] = useState<any>(null)
  const [skinTone, setSkinTone] = useState("")
  const [hairColor, setHairColor] = useState("")
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!skinTone || !hairColor) return

    setGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setPalette({
      name: "Warm Autumn Palette",
      description: "Rich, warm tones that complement your natural coloring",
      colors: [
        { hex: "#8B4513", name: "Saddle Brown", category: "Neutral" },
        { hex: "#CD853F", name: "Peru", category: "Warm" },
        { hex: "#DEB887", name: "Burlywood", category: "Light" },
        { hex: "#D2691E", name: "Chocolate", category: "Accent" },
        { hex: "#F4A460", name: "Sandy Brown", category: "Warm" },
        { hex: "#8B7355", name: "Burlywood Dark", category: "Neutral" },
        { hex: "#A0522D", name: "Sienna", category: "Accent" },
        { hex: "#BC8F8F", name: "Rosy Brown", category: "Light" },
      ],
      recommendations: [
        "These warm tones enhance your natural glow",
        "Avoid cool blues and purples",
        "Gold jewelry complements this palette better than silver",
        "Earth tones create a harmonious look",
      ],
    })
    setGenerating(false)
  }

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex)
    setCopiedColor(hex)
    toast.success(`Copied ${hex} to clipboard!`)
    setTimeout(() => setCopiedColor(null), 2000)
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Find Your Colors</CardTitle>
          <CardDescription>Discover the perfect color palette for your natural features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="skin-tone">Skin Tone</Label>
            <Select value={skinTone} onValueChange={setSkinTone}>
              <SelectTrigger id="skin-tone">
                <SelectValue placeholder="Select your skin tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fair-cool">Fair (Cool Undertone)</SelectItem>
                <SelectItem value="fair-warm">Fair (Warm Undertone)</SelectItem>
                <SelectItem value="light-cool">Light (Cool Undertone)</SelectItem>
                <SelectItem value="light-warm">Light (Warm Undertone)</SelectItem>
                <SelectItem value="medium-cool">Medium (Cool Undertone)</SelectItem>
                <SelectItem value="medium-warm">Medium (Warm Undertone)</SelectItem>
                <SelectItem value="olive">Olive</SelectItem>
                <SelectItem value="tan-cool">Tan (Cool Undertone)</SelectItem>
                <SelectItem value="tan-warm">Tan (Warm Undertone)</SelectItem>
                <SelectItem value="deep-cool">Deep (Cool Undertone)</SelectItem>
                <SelectItem value="deep-warm">Deep (Warm Undertone)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hair-color">Hair Color</Label>
            <Select value={hairColor} onValueChange={setHairColor}>
              <SelectTrigger id="hair-color">
                <SelectValue placeholder="Select your hair color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="platinum">Platinum Blonde</SelectItem>
                <SelectItem value="blonde">Blonde</SelectItem>
                <SelectItem value="light-brown">Light Brown</SelectItem>
                <SelectItem value="brown">Brown</SelectItem>
                <SelectItem value="dark-brown">Dark Brown</SelectItem>
                <SelectItem value="black">Black</SelectItem>
                <SelectItem value="red">Red</SelectItem>
                <SelectItem value="auburn">Auburn</SelectItem>
                <SelectItem value="gray">Gray/Silver</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!skinTone || !hairColor || generating}
            className="w-full"
            size="lg"
          >
            {generating ? (
              <>
                <Spinner className="mr-2" />
                Generating Palette...
              </>
            ) : (
              <>
                <Palette className="mr-2 w-4 h-4" />
                Generate My Palette
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Palette Display */}
      <Card className={palette ? "border-primary/50" : ""}>
        <CardHeader>
          <CardTitle>Your Color Palette</CardTitle>
          <CardDescription>
            {palette ? "Colors that complement your natural features" : "Your personalized palette will appear here"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {palette ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">{palette.name}</h3>
                <p className="text-sm text-muted-foreground">{palette.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {palette.colors.map((color: any, index: number) => (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-lg border-2 border-border hover:border-primary/50 transition-all cursor-pointer"
                    onClick={() => copyToClipboard(color.hex)}
                  >
                    <div className="h-24 w-full" style={{ backgroundColor: color.hex }} />
                    <div className="p-3 bg-card">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{color.name}</span>
                        {copiedColor === color.hex ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-mono">{color.hex}</span>
                        <Badge variant="outline" className="text-xs">
                          {color.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-3 text-sm">Color Recommendations</h4>
                <ul className="space-y-2">
                  {palette.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Palette className="w-12 h-12 mb-4 opacity-50" />
              <p>Your personalized color palette will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
