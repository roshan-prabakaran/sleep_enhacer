class SleepDeviceApp {
  constructor() {
    this.deviceStatus = {}
    this.timerInterval = null
    this.timerActive = false
    this.timerMinutes = 30

    this.init()
  }

  init() {
    this.setupNavigation()
    this.setupControls()
    this.setupTimer()
    this.loadDeviceStatus()
    this.loadAnalytics()
  }

  setupNavigation() {
    const navBtns = document.querySelectorAll(".nav-btn")
    const tabContents = document.querySelectorAll(".tab-content")

    navBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const tabId = btn.dataset.tab

        // Update active nav button
        navBtns.forEach((b) => b.classList.remove("active"))
        btn.classList.add("active")

        // Update active tab content
        tabContents.forEach((tab) => tab.classList.remove("active"))
        document.getElementById(tabId).classList.add("active")
      })
    })
  }

  setupControls() {
    // Aromatherapy controls
    const aromatherapyToggle = document.getElementById("aromatherapyToggle")
    const aromatherapyIntensity = document.getElementById("aromatherapyIntensity")
    const fragranceSelect = document.getElementById("fragranceSelect")

    aromatherapyToggle.addEventListener("change", () => {
      this.controlDevice("aromatherapy", "toggle")
    })

    aromatherapyIntensity.addEventListener("input", (e) => {
      document.querySelector("#aromatherapyIntensity + .value-display").textContent = e.target.value + "%"
      this.controlDevice("aromatherapy", "set", { intensity: Number.parseInt(e.target.value) })
    })

    fragranceSelect.addEventListener("change", (e) => {
      this.controlDevice("aromatherapy", "set", { fragrance: e.target.value })
    })

    // Vibration controls
    const vibrationToggle = document.getElementById("vibrationToggle")
    const vibrationIntensity = document.getElementById("vibrationIntensity")

    vibrationToggle.addEventListener("change", () => {
      this.controlDevice("vibration", "toggle")
    })

    vibrationIntensity.addEventListener("input", (e) => {
      document.querySelector("#vibrationIntensity + .value-display").textContent = e.target.value + "%"
      this.controlDevice("vibration", "set", { intensity: Number.parseInt(e.target.value) })
    })

    // Sound controls
    const soundToggle = document.getElementById("soundToggle")
    const soundVolume = document.getElementById("soundVolume")
    const soundSelect = document.getElementById("soundSelect")

    soundToggle.addEventListener("change", () => {
      this.controlDevice("sound", "toggle")
    })

    soundVolume.addEventListener("input", (e) => {
      document.querySelector("#soundVolume + .value-display").textContent = e.target.value + "%"
      this.controlDevice("sound", "set", { volume: Number.parseInt(e.target.value) })
    })

    soundSelect.addEventListener("change", (e) => {
      this.controlDevice("sound", "set", { track: e.target.value })
    })
  }

  setupTimer() {
    const presetBtns = document.querySelectorAll(".preset-btn")
    const startBtn = document.getElementById("startTimer")
    const stopBtn = document.getElementById("stopTimer")
    const timerDisplay = document.getElementById("timerMinutes")

    presetBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        presetBtns.forEach((b) => b.classList.remove("active"))
        btn.classList.add("active")

        this.timerMinutes = Number.parseInt(btn.dataset.minutes)
        timerDisplay.textContent = this.timerMinutes
      })
    })

    startBtn.addEventListener("click", () => {
      this.startTimer()
    })

    stopBtn.addEventListener("click", () => {
      this.stopTimer()
    })
  }

  startTimer() {
    this.timerActive = true
    let remainingSeconds = this.timerMinutes * 60

    document.getElementById("startTimer").style.display = "none"
    document.getElementById("stopTimer").style.display = "flex"
    document.querySelector(".timer-circle").classList.add("active")

    this.timerInterval = setInterval(() => {
      remainingSeconds--
      const minutes = Math.floor(remainingSeconds / 60)
      const seconds = remainingSeconds % 60

      document.getElementById("timerMinutes").textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`

      if (remainingSeconds <= 0) {
        this.stopTimer()
        this.showNotification("Timer completed! Sweet dreams! 🌙")
      }
    }, 1000)
  }

  stopTimer() {
    this.timerActive = false
    clearInterval(this.timerInterval)

    document.getElementById("startTimer").style.display = "flex"
    document.getElementById("stopTimer").style.display = "none"
    document.querySelector(".timer-circle").classList.remove("active")
    document.getElementById("timerMinutes").textContent = this.timerMinutes
  }

  async controlDevice(feature, action, value = null) {
    try {
      const response = await fetch("/api/device/control", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feature, action, value }),
      })

      const data = await response.json()
      if (data.success) {
        this.deviceStatus = data.status
        this.updateUI()
      }
    } catch (error) {
      console.error("Error controlling device:", error)
      this.showNotification("Connection error. Please try again.")
    }
  }

  async loadDeviceStatus() {
    try {
      const response = await fetch("/api/device/status")
      this.deviceStatus = await response.json()
      this.updateUI()
    } catch (error) {
      console.error("Error loading device status:", error)
    }
  }

  updateUI() {
    // Update aromatherapy controls
    if (this.deviceStatus.aromatherapy) {
      document.getElementById("aromatherapyToggle").checked = this.deviceStatus.aromatherapy.enabled
      document.getElementById("aromatherapyIntensity").value = this.deviceStatus.aromatherapy.intensity
      document.querySelector("#aromatherapyIntensity + .value-display").textContent =
        this.deviceStatus.aromatherapy.intensity + "%"
      document.getElementById("fragranceSelect").value = this.deviceStatus.aromatherapy.fragrance
    }

    // Update vibration controls
    if (this.deviceStatus.vibration) {
      document.getElementById("vibrationToggle").checked = this.deviceStatus.vibration.enabled
      document.getElementById("vibrationIntensity").value = this.deviceStatus.vibration.intensity
      document.querySelector("#vibrationIntensity + .value-display").textContent =
        this.deviceStatus.vibration.intensity + "%"
    }

    // Update sound controls
    if (this.deviceStatus.sound) {
      document.getElementById("soundToggle").checked = this.deviceStatus.sound.enabled
      document.getElementById("soundVolume").value = this.deviceStatus.sound.volume
      document.querySelector("#soundVolume + .value-display").textContent = this.deviceStatus.sound.volume + "%"
      document.getElementById("soundSelect").value = this.deviceStatus.sound.track
    }

    // Update connection status
    const connectionStatus = document.getElementById("connectionStatus")
    if (this.deviceStatus.connected) {
      connectionStatus.innerHTML = '<i class="fas fa-wifi"></i><span>Connected</span>'
      connectionStatus.style.color = "#10b981"
    } else {
      connectionStatus.innerHTML = '<i class="fas fa-wifi-slash"></i><span>Disconnected</span>'
      connectionStatus.style.color = "#ef4444"
    }
  }

  async loadAnalytics() {
    try {
      const response = await fetch("/api/sleep/data")
      const sleepData = await response.json()

      this.updateAnalytics(sleepData)
      this.drawChart(sleepData)
    } catch (error) {
      console.error("Error loading analytics:", error)
    }
  }

  updateAnalytics(data) {
    if (data.length === 0) return

    const avgSleep = data.reduce((sum, day) => sum + day.duration, 0) / data.length
    const avgQuality = data.reduce((sum, day) => sum + day.quality, 0) / data.length
    const avgDeepSleep = data.reduce((sum, day) => sum + day.deep_sleep, 0) / data.length
    const avgRemSleep = data.reduce((sum, day) => sum + day.rem_sleep, 0) / data.length

    document.getElementById("avgSleep").textContent = avgSleep.toFixed(1) + "h"
    document.getElementById("sleepQuality").textContent = Math.round(avgQuality) + "%"
    document.getElementById("deepSleep").textContent = (avgDeepSleep / 10).toFixed(1) + "h"
    document.getElementById("remSleep").textContent = (avgRemSleep / 10).toFixed(1) + "h"
  }

  drawChart(data) {
    const canvas = document.getElementById("sleepChart")
    const ctx = canvas.getContext("2d")

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (data.length === 0) return

    const padding = 40
    const chartWidth = canvas.width - 2 * padding
    const chartHeight = canvas.height - 2 * padding

    // Find max value for scaling
    const maxDuration = Math.max(...data.map((d) => d.duration))
    const maxQuality = Math.max(...data.map((d) => d.quality))

    // Draw grid lines
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1

    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(padding + chartWidth, y)
      ctx.stroke()
    }

    // Draw sleep duration line
    ctx.strokeStyle = "#4f46e5"
    ctx.lineWidth = 3
    ctx.beginPath()

    data.reverse().forEach((day, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index
      const y = padding + chartHeight - (day.duration / maxDuration) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw sleep quality line
    ctx.strokeStyle = "#10b981"
    ctx.lineWidth = 2
    ctx.beginPath()

    data.forEach((day, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index
      const y = padding + chartHeight - (day.quality / 100) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Add legend
    ctx.font = "12px Arial"
    ctx.fillStyle = "#4f46e5"
    ctx.fillText("Sleep Duration", padding, 20)
    ctx.fillStyle = "#10b981"
    ctx.fillText("Sleep Quality", padding + 100, 20)
  }

  showNotification(message) {
    // Create notification element
    const notification = document.createElement("div")
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #4f46e5;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 1000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `
    notification.textContent = message

    document.body.appendChild(notification)

    // Remove notification after 3 seconds
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 3000)
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new SleepDeviceApp()
})
