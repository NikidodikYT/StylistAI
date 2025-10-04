"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

export function StyleAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [bodyType, setBodyType] = useState("")
  const [preferences, setPreferences] = useState("")
  const [occasion, setOccasion] = useState("")

  const handleAnalyze = async () => {
    if (!bodyType || !preferences) return

    setAnalyzing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setResult({
      styleProfile: "Modern Minimalist",
      confidence: 92,
      recommendations: [
        "Tailored blazers in neutral tones",
        "High-waisted trousers",
        "Classic white button-down shirts",
        "Minimalist accessories",
        "Structured handbags",
      ],
      colors: ["#2C3E50", "#ECF0F1", "#95A5A6", "#34495E", "#BDC3C7"],
      tips: [
        "Focus on quality over quantity",
        "Invest in timeless pieces",
        "Stick to a cohesive color palette",
        "Emphasize clean lines and structure",
      ],
    })
    setAnalyzing(false)
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tell Us About Your Style</CardTitle>
          <CardDescription>Share your preferences and we'll analyze your unique style profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="body-type">Body Type</Label>
            <Select value={bodyType} onValueChange={setBodyType}>
              <SelectTrigger id="body-type">
                <SelectValue placeholder="Select your body type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourglass">Hourglass</SelectItem>
                <SelectItem value="pear">Pear</SelectItem>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="rectangle">Rectangle</SelectItem>
                <SelectItem value="inverted-triangle">Inverted Triangle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="occasion">Primary Occasion</Label>
            <Select value={occasion} onValueChange={setOccasion}>
              <SelectTrigger id="occasion">
                <SelectValue placeholder="Select occasion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casual">Casual Daily Wear</SelectItem>
                <SelectItem value="business">Business/Professional</SelectItem>
                <SelectItem value="formal">Formal Events</SelectItem>
                <SelectItem value="athletic">Athletic/Sporty</SelectItem>
                <SelectItem value="creative">Creative/Artistic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferences">Style Preferences</Label>
            <Textarea
              id="preferences"
              placeholder="Describe your style preferences, favorite colors, patterns you like, clothing items you love..."
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!bodyType || !preferences || analyzing}
            className="w-full"
            size="lg"
          >
            {analyzing ? (
              <>
                <Spinner className="mr-2" />
                Analyzing Your Style...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 w-4 h-4" />
                Analyze My Style
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card className={result ? "border-primary/50" : ""}>
        <CardHeader>
          <CardTitle>Your Style Profile</CardTitle>
          <CardDescription>
            {result ? "AI-generated insights based on your preferences" : "Complete the form to see your results"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold">{result.styleProfile}</h3>
                  <Badge variant="secondary">{result.confidence}% Match</Badge>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Recommended Items</h4>
                <ul className="space-y-2">
                  {result.recommendations.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Your Color Palette</h4>
                <div className="flex gap-2 flex-wrap">
                  {result.colors.map((color: string, index: number) => (
                    <div
                      key={index}
                      className="w-12 h-12 rounded-lg border-2 border-border shadow-sm"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Style Tips</h4>
                <ul className="space-y-2">
                  {result.tips.map((tip: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Sparkles className="w-12 h-12 mb-4 opacity-50" />
              <p>Your personalized style analysis will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
