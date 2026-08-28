import { LocalNotifications } from '@capacitor/local-notifications'
import translations from '../i18n/translations'

export const THRESHOLD_ALERT_ID = 8001
export const DAILY_SUMMARY_ID = 7001
export const SAMPLE_SUMMARY_ID = 7002
let thresholdChannelCreated = false
let dailyChannelCreated = false

// Cooldown tracker to prevent notification spamming (enforces 5 min minimum between auto-alerts)
let lastThresholdAlertTimestamp = 0
let lastNotifiedCity = null
let lastNotifiedThreshold = null

/**
 * Resolves the active language from parameter, storage, or defaults to English
 */
export function getActiveLanguage(customLang) {
  if (customLang && translations[customLang]) return customLang
  try {
    const saved = localStorage.getItem('sentinelaq_lang')
    if (saved && translations[saved]) return saved
  } catch (_) {}
  return 'en'
}

/**
 * Returns localized string with template replacements
 */
export function getLocalizedText(key, lang, replacements = {}) {
  const activeLang = getActiveLanguage(lang)
  let text = translations[activeLang]?.[key] ?? translations['en']?.[key] ?? key
  Object.keys(replacements).forEach((placeholder) => {
    text = text.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), replacements[placeholder])
  })
  return text
}

/**
 * Ensures threshold notification channel is registered on Android for high-priority alerts
 */
async function ensureThresholdChannel() {
  if (thresholdChannelCreated) return
  try {
    await LocalNotifications.createChannel({
      id: 'aqi-threshold-alerts',
      name: 'SentinelAQ Threshold Alerts',
      description: 'Alerts triggered when air quality exceeds user-defined threshold',
      importance: 5, // Max importance (heads-up notification)
      visibility: 1,
      vibration: true,
      lights: true,
      lightColor: '#FF0000',
    })
    thresholdChannelCreated = true
  } catch (err) {
    console.debug('Threshold notification channel creation skipped:', err)
  }
}

/**
 * Ensures daily summary notification channel is registered on Android
 */
async function ensureDailyChannel() {
  if (dailyChannelCreated) return
  try {
    await LocalNotifications.createChannel({
      id: 'aqi-daily-summary',
      name: 'SentinelAQ Daily Morning Summary',
      description: 'Daily morning air quality forecast summary at 7:00 AM',
      importance: 4,
      visibility: 1,
      vibration: true,
      lights: true,
      lightColor: '#004c6b',
    })
    dailyChannelCreated = true
  } catch (err) {
    console.debug('Daily summary channel creation skipped:', err)
  }
}

/**
 * Request notification permissions across native Capacitor and browser
 */
export async function requestNotificationPermission() {
  try {
    const status = await LocalNotifications.checkPermissions()
    if (status.display !== 'granted') {
      const res = await LocalNotifications.requestPermissions()
      return res.display === 'granted'
    }
    return true
  } catch (err) {
    console.debug('Native permission check fallback to web:', err)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const res = await Notification.requestPermission()
      return res === 'granted'
    }
    return false
  }
}

/**
 * Send a localized push/local notification when AQI exceeds threshold.
 * Strictly limited to 1 single active notification at all times (updates in place).
 */
export async function sendAQIThresholdAlert({ aqi, threshold, cityName, statusText, force = false, lang }) {
  const numericAqi = Number(aqi)
  if (isNaN(numericAqi)) return false

  const activeLang = getActiveLanguage(lang)
  const now = Date.now()

  // Anti-spam cooldown: enforce at least 5 minutes (300,000 ms) between alerts for the same city/threshold unless forced
  const isDuplicate =
    cityName === lastNotifiedCity &&
    Math.abs(threshold - (lastNotifiedThreshold || 0)) <= 3 &&
    now - lastThresholdAlertTimestamp < 300000

  if (!force && isDuplicate) {
    console.log('[SentinelAQ] Notification throttled (1 active alert already delivered).')
    return false
  }

  const title = getLocalizedText('notifThresholdTitle', activeLang, { city: cityName })
  const body = getLocalizedText('notifThresholdBody', activeLang, {
    aqi: numericAqi,
    threshold,
    status: statusText || 'Elevated',
  })

  try {
    const hasPermission = await requestNotificationPermission()
    if (!hasPermission) {
      console.warn('Notification permission not granted.')
      return false
    }

    await ensureThresholdChannel()

    // 1. Cancel previous threshold alert to guarantee max 1 active notification in tray
    try {
      await LocalNotifications.cancel({ notifications: [{ id: THRESHOLD_ALERT_ID }] })
    } catch (_) {}

    // 2. Schedule single notification with fixed ID THRESHOLD_ALERT_ID (replaces in tray)
    await LocalNotifications.schedule({
      notifications: [
        {
          id: THRESHOLD_ALERT_ID,
          title,
          body,
          channelId: 'aqi-threshold-alerts',
          schedule: { at: new Date(Date.now() + 100) },
          smallIcon: 'ic_launcher',
          extra: {
            aqi: numericAqi,
            threshold,
            cityName,
            lang: activeLang,
            timestamp: new Date().toISOString(),
          },
        },
      ],
    })

    lastThresholdAlertTimestamp = now
    lastNotifiedCity = cityName
    lastNotifiedThreshold = threshold

    console.log(`[SentinelAQ] Dispatched single threshold notification in [${activeLang}]: AQI ${numericAqi} > Threshold ${threshold}`)
    return true
  } catch (err) {
    console.warn('Native LocalNotifications schedule failed, falling back to Web Notification:', err)
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/District.png',
      })
      lastThresholdAlertTimestamp = now
      return true
    }
  }
  return false
}

/**
 * Schedule repeating daily morning summary notification (at 7:00 AM) in active language
 */
export async function scheduleDailySummaryNotification({ cityName, aqi, hour = 7, minute = 0, lang }) {
  try {
    const activeLang = getActiveLanguage(lang)
    const hasPermission = await requestNotificationPermission()
    if (!hasPermission) {
      console.warn('Notification permission not granted for daily summary.')
      return false
    }

    await ensureDailyChannel()

    // Cancel existing scheduled daily summary if any
    try {
      await LocalNotifications.cancel({ notifications: [{ id: DAILY_SUMMARY_ID }] })
    } catch (_) {}

    const title = getLocalizedText('notifDailySummaryTitle', activeLang, { city: cityName })
    const body = getLocalizedText('notifDailySummaryBody', activeLang, { aqi: aqi || 'Normal' })

    await LocalNotifications.schedule({
      notifications: [
        {
          id: DAILY_SUMMARY_ID,
          title,
          body,
          channelId: 'aqi-daily-summary',
          schedule: {
            on: {
              hour,
              minute,
            },
            repeats: true,
            allowWhileIdle: true,
          },
          smallIcon: 'ic_launcher',
          extra: {
            type: 'dailySummary',
            scheduledTime: `${hour}:${minute < 10 ? '0' : ''}${minute}`,
            lang: activeLang,
          },
        },
      ],
    })
    console.log(`[SentinelAQ] Daily morning summary scheduled in [${activeLang}] for ${hour}:${minute < 10 ? '0' : ''}${minute}`)
    return true
  } catch (err) {
    console.warn('Failed to schedule daily summary notification:', err)
    return false
  }
}

/**
 * Send a sample/test daily morning summary notification in active language
 */
export async function sendSampleDailySummaryNotification({ cityName, aqi, delaySeconds = 5, lang }) {
  try {
    const activeLang = getActiveLanguage(lang)
    const hasPermission = await requestNotificationPermission()
    if (!hasPermission) return false

    await ensureDailyChannel()

    const triggerDate = new Date(Date.now() + delaySeconds * 1000)
    const title = getLocalizedText('notifDailySummaryTitle', activeLang, { city: cityName })
    const body = getLocalizedText('notifDailySummaryTestBody', activeLang, { aqi: aqi || 'Normal' })

    await LocalNotifications.schedule({
      notifications: [
        {
          id: SAMPLE_SUMMARY_ID,
          title,
          body,
          channelId: 'aqi-daily-summary',
          schedule: { at: triggerDate },
          smallIcon: 'ic_launcher',
          extra: {
            type: 'dailySummaryTest',
            lang: activeLang,
          },
        },
      ],
    })
    console.log(`[SentinelAQ] Sample daily summary scheduled in [${activeLang}] to trigger in ${delaySeconds}s.`)
    return true
  } catch (err) {
    console.warn('Failed to trigger sample daily summary:', err)
    return false
  }
}

/**
 * Cancel the scheduled daily morning summary notification
 */
export async function cancelDailySummaryNotification() {
  try {
    await LocalNotifications.cancel({
      notifications: [{ id: DAILY_SUMMARY_ID }, { id: SAMPLE_SUMMARY_ID }],
    })
    console.log('[SentinelAQ] Daily morning summary notifications cancelled.')
    return true
  } catch (err) {
    console.warn('Failed to cancel daily summary notification:', err)
    return false
  }
}
