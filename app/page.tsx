"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Leaf,
  Hand,
  Music,
  Clock,
  Play,
  Square,
  Wifi,
  WifiOff,
  Bed,
  Star,
  Moon,
  Brain,
  Settings,
  BarChart3,
} from "lucide-react"

interface DeviceStatus {
  aromatherapy: {
    enabled: boolean
    intensity: number
    fragrance: string
  }
  vibration: {
    enabled: boolean
    intensity: number
  }
  sound: {
    enabled: boolean
    volume: number
    track: string
  }
  timer: {
    active: boolean
    duration: number
    remaining?: number
  }
  connected: boolean
}

interface SleepData {
  date: string
  duration: number
  quality: number
  deepSleep: number
  remSleep: number
}

export default function SleepDeviceApp() {
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    aromatherapy: { enabled: false, intensity: 50, fragrance: "lavender" },
    vibration: { enabled: false, intensity: 30 },
    sound: { enabled: false, volume: 40, track: "rain" },
    timer: { active: false, duration: 30 },
    connected: true,
  })

  const [sleepData] = useState<SleepData[]>([
    { date: "2024-01-07", duration: 7.5, quality: 85, deepSleep: 2.1, remSleep: 1.8 },
    { date: "2024-01-06", duration: 8.2, quality: 92, deepSleep: 2.4, remSleep: 2.1 },
    { date: "2024-01-05", duration: 6.8, quality: 78, deepSleep: 1.9, remSleep: 1.5 },
    { date: "2024-01-04", duration: 7.9, quality: 88, deepSleep: 2.3, remSleep: 1.9 },
    { date: "2024-01-03", duration: 7.2, quality: 82, deepSleep: 2.0, remSleep: 1.7 },
    { date: "2024-01-02", duration: 8.1, quality: 90, deepSleep: 2.5, remSleep: 2.0 },
    { date: "2024-01-01", duration: 7.6, quality: 86, deepSleep: 2.2, remSleep: 1.8 },
  ])

  const [timerDisplay, setTimerDisplay] = useState("30:00")
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const updateDevice = (feature: keyof DeviceStatus, updates: any) => {
    setDeviceStatus((prev) => ({
      ...prev,
      [feature]: { ...prev[feature], ...updates },
    }))
  }

  const startTimer = () => {
    const duration = deviceStatus.timer.duration * 60 // Convert to seconds
    let remaining = duration

    updateDevice("timer", { active: true, remaining })

    timerRef.current = setInterval(() => {
      remaining -= 1
      const minutes = Math.floor(remaining / 60)
      const seconds = remaining % 60
      setTimerDisplay(`${minutes}:${seconds.toString().padStart(2, "0")}`)

      if (remaining <= 0) {
        stopTimer()
        // Show completion notification
        alert("Timer completed! Sweet dreams! 🌙")
      }
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    updateDevice("timer", { active: false })
    setTimerDisplay(`${deviceStatus.timer.duration}:00`)
  }

  const setTimerDuration = (minutes: number) => {
    updateDevice("timer", { duration: minutes })
    if (!deviceStatus.timer.active) {
      setTimerDisplay(`${minutes}:00`)
    }
  }

  // Calculate analytics
  const avgSleep = sleepData.reduce((sum, day) => sum + day.duration, 0) / sleepData.length
  const avgQuality = sleepData.reduce((sum, day) => sum + day.quality, 0) / sleepData.length
  const avgDeepSleep = sleepData.reduce((sum, day) => sum + day.deepSleep, 0) / sleepData.length
  const avgRemSleep = sleepData.reduce((sum, day) => sum + day.remSleep, 0) / sleepData.length

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Moon className="w-6 h-6" />
            <h1 className="text-2xl font-bold">SleepWell</h1>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm opacity-90">
            {deviceStatus.connected ? (
              <>
                <Wifi className="w-4 h-4" />
                <span>Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span>Disconnected</span>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 pb-20">
          <Tabs defaultValue="control" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="control" className="text-xs">
                <Settings className="w-4 h-4 mb-1" />
                Control
              </TabsTrigger>
              <TabsTrigger value="timer" className="text-xs">
                <Clock className="w-4 h-4 mb-1" />
                Timer
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs">
                <BarChart3 className="w-4 h-4 mb-1" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs">
                <Settings className="w-4 h-4 mb-1" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Control Tab */}
            <TabsContent value="control" className="space-y-4 mt-4">
              {/* Aromatherapy Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Leaf className="w-6 h-6 text-green-500" />
                      <CardTitle className="text-lg">Aromatherapy</CardTitle>
                    </div>
                    <Switch
                      checked={deviceStatus.aromatherapy.enabled}
                      onCheckedChange={(checked) => updateDevice("aromatherapy", { enabled: checked })}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">Intensity</label>
                      <Badge variant="secondary">{deviceStatus.aromatherapy.intensity}%</Badge>
                    </div>
                    <Slider
                      value={[deviceStatus.aromatherapy.intensity]}
                      onValueChange={([value]) => updateDevice("aromatherapy", { intensity: value })}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Fragrance</label>
                    <Select
                      value={deviceStatus.aromatherapy.fragrance}
                      onValueChange={(value) => updateDevice("aromatherapy", { fragrance: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lavender">Lavender</SelectItem>
                        <SelectItem value="eucalyptus">Eucalyptus</SelectItem>
                        <SelectItem value="chamomile">Chamomile</SelectItem>
                        <SelectItem value="vanilla">Vanilla</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Vibration Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Hand className="w-6 h-6 text-blue-500" />
                      <CardTitle className="text-lg">Vibration Massage</CardTitle>
                    </div>
                    <Switch
                      checked={deviceStatus.vibration.enabled}
                      onCheckedChange={(checked) => updateDevice("vibration", { enabled: checked })}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Intensity</label>
                    <Badge variant="secondary">{deviceStatus.vibration.intensity}%</Badge>
                  </div>
                  <Slider
                    value={[deviceStatus.vibration.intensity]}
                    onValueChange={([value]) => updateDevice("vibration", { intensity: value })}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </CardContent>
              </Card>

              {/* Sound Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Music className="w-6 h-6 text-purple-500" />
                      <CardTitle className="text-lg">Sound Therapy</CardTitle>
                    </div>
                    <Switch
                      checked={deviceStatus.sound.enabled}
                      onCheckedChange={(checked) => updateDevice("sound", { enabled: checked })}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">Volume</label>
                      <Badge variant="secondary">{deviceStatus.sound.volume}%</Badge>
                    </div>
                    <Slider
                      value={[deviceStatus.sound.volume]}
                      onValueChange={([value]) => updateDevice("sound", { volume: value })}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sound Track</label>
                    <Select
                      value={deviceStatus.sound.track}
                      onValueChange={(value) => updateDevice("sound", { track: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rain">Rain Sounds</SelectItem>
                        <SelectItem value="ocean">Ocean Waves</SelectItem>
                        <SelectItem value="forest">Forest Ambience</SelectItem>
                        <SelectItem value="white-noise">White Noise</SelectItem>
                        <SelectItem value="meditation">Meditation Music</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timer Tab */}
            <TabsContent value="timer" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Sleep Timer</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                  <div className="relative">
                    <div
                      className={`w-48 h-48 mx-auto rounded-full border-8 flex items-center justify-center ${
                        deviceStatus.timer.active ? "border-indigo-500 animate-pulse" : "border-gray-200"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-4xl font-bold text-indigo-600">{timerDisplay}</div>
                        <div className="text-sm text-gray-500">minutes</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-2">
                    {[15, 30, 45, 60].map((minutes) => (
                      <Button
                        key={minutes}
                        variant={deviceStatus.timer.duration === minutes ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTimerDuration(minutes)}
                        disabled={deviceStatus.timer.active}
                      >
                        {minutes}m
                      </Button>
                    ))}
                  </div>

                  <div className="flex justify-center">
                    {!deviceStatus.timer.active ? (
                      <Button onClick={startTimer} className="flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Start Timer
                      </Button>
                    ) : (
                      <Button onClick={stopTimer} variant="destructive" className="flex items-center gap-2">
                        <Square className="w-4 h-4" />
                        Stop Timer
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Bed className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{avgSleep.toFixed(1)}h</div>
                    <div className="text-sm text-gray-500">Avg Sleep</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{Math.round(avgQuality)}%</div>
                    <div className="text-sm text-gray-500">Sleep Quality</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Moon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{avgDeepSleep.toFixed(1)}h</div>
                    <div className="text-sm text-gray-500">Deep Sleep</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Brain className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{avgRemSleep.toFixed(1)}h</div>
                    <div className="text-sm text-gray-500">REM Sleep</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sleep Trends (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sleepData.slice(0, 7).map((day, index) => (
                      <div key={day.date} className="flex items-center justify-between">
                        <div className="text-sm">
                          {new Date(day.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm font-medium">{day.duration}h</div>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${day.quality}%` }} />
                          </div>
                          <div className="text-sm text-gray-500">{day.quality}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Device Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Auto-off Timer</label>
                    <Select defaultValue="30min">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30min">30 minutes</SelectItem>
                        <SelectItem value="1hour">1 hour</SelectItem>
                        <SelectItem value="2hours">2 hours</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Notification Sounds</label>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sleep Tracking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Track Sleep Automatically</label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Smart Wake-up</label>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data & Privacy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Export Sleep Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Clear All Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Privacy Policy
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
