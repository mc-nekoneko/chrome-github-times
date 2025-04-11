let settings = {
  timezone: 'auto',
  dateFormat: 'yyyy/MM/dd HH:mm',
  showTimezone: 'none',
}

function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      {
        timezone: 'auto',
        dateFormat: 'yyyy/MM/dd HH:mm',
        showTimezone: 'none',
      },
      (items) => {
        settings = items
        resolve(settings)
      },
    )
  })
}

/**
 * 現在の設定に基づいてタイムゾーン情報を取得
 * @returns {{text: string, short: string}} タイムゾーン情報
 */
function getTimezoneInfo() {
  const timezone = settings.timezone

  if (settings.showTimezone === 'none') {
    return { text: '', short: '' }
  }

  try {
    if (timezone === 'auto') {
      return getLocalTimezoneInfo()
    }
    return getSpecificTimezoneInfo(timezone)
  } catch (e) {
    console.error('タイムゾーン情報の取得に失敗しました:', e)
    return { text: '', short: '' }
  }
}

/**
 * ローカルタイムゾーン情報を取得
 * @returns {{text: string, short: string}} タイムゾーン情報
 */
function getLocalTimezoneInfo() {
  if (settings.showTimezone === 'abbr') {
    const date = new Date()
    const tzAbbr = date
      .toLocaleTimeString('en-US', { timeZoneName: 'short' })
      .split(' ')[2]
    return { text: tzAbbr || '', short: tzAbbr || '' }
  }

  const offset = -new Date().getTimezoneOffset()
  const sign = offset >= 0 ? '+' : '-'
  const hours = Math.floor(Math.abs(offset) / 60)
  const offsetText = `UTC${sign}${hours}`
  return { text: offsetText, short: offsetText }
}

/**
 * 特定のタイムゾーン情報を取得
 * @param {string} timezone タイムゾーン名
 * @returns {{text: string, short: string}} タイムゾーン情報
 */
function getSpecificTimezoneInfo(timezone) {
  const date = new Date()

  if (settings.showTimezone === 'abbr') {
    const options = { timeZone: timezone, timeZoneName: 'short' }
    const tzInfo = date.toLocaleTimeString('en-US', options).split(' ')[2]
    return { text: tzInfo, short: tzInfo }
  }

  const localTime = date.getTime()
  const localOffset = date.getTimezoneOffset() * 60000
  const utc = localTime + localOffset
  const targetTime = new Date(utc)

  const targetDate = new Date(
    targetTime.toLocaleString('en-US', { timeZone: timezone }),
  )

  const targetOffset = (targetDate - targetTime) / 60000
  const hours = Math.abs(Math.floor(targetOffset / 60))
  const sign = targetOffset >= 0 ? '+' : '-'
  const offsetText = `UTC${sign}${hours}`

  return { text: offsetText, short: offsetText }
}

/**
 * 日付をフォーマット
 * @param {Date} date 日付オブジェクト
 * @param {boolean} dateOnly 日付のみを返すかどうか
 * @returns {string} フォーマットされた日付文字列
 */
function formatDate(date, dateOnly = false) {
  // タイムゾーン設定に応じた日付を取得
  const dateComponents = getAdjustedDateComponents(date)

  // 日付文字列を生成
  return formatDateString(dateComponents, dateOnly)
}

/**
 * タイムゾーン設定に応じた日付コンポーネントを取得
 * @param {Date} date 日付オブジェクト
 * @returns {Object} 年月日時分の各コンポーネント
 */
function getAdjustedDateComponents(date) {
  if (settings.timezone !== 'auto') {
    try {
      return getDateComponentsWithTimezone(date, settings.timezone)
    } catch (e) {
      console.error('タイムゾーン調整に失敗しました:', e)
    }
  }

  // デフォルトはローカルタイムゾーン
  return {
    year: date.getFullYear(),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    day: String(date.getDate()).padStart(2, '0'),
    hours: String(date.getHours()).padStart(2, '0'),
    minutes: String(date.getMinutes()).padStart(2, '0'),
  }
}

/**
 * 特定のタイムゾーンでの日付コンポーネントを取得
 * @param {Date} date 日付オブジェクト
 * @param {string} timezone タイムゾーン名
 * @returns {Object} 年月日時分の各コンポーネント
 */
function getDateComponentsWithTimezone(date, timezone) {
  const utcTime = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  )

  const tzDate = new Date(utcTime)

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  })

  const parts = formatter.formatToParts(tzDate)

  return {
    year: parts.find((part) => part.type === 'year').value,
    month: parts.find((part) => part.type === 'month').value.padStart(2, '0'),
    day: parts.find((part) => part.type === 'day').value.padStart(2, '0'),
    hours: parts.find((part) => part.type === 'hour').value.padStart(2, '0'),
    minutes: parts
      .find((part) => part.type === 'minute')
      .value.padStart(2, '0'),
  }
}

/**
 * 日付コンポーネントから日付文字列を生成
 * @param {Object} components 日付コンポーネント
 * @param {boolean} dateOnly 日付のみを返すかどうか
 * @returns {string} フォーマットされた日付文字列
 */
function formatDateString(components, dateOnly) {
  const { year, month, day, hours, minutes } = components

  // 日付のみのフォーマット（時間なし）
  if (dateOnly) {
    switch (settings.dateFormat) {
      case 'yyyy/MM/dd HH:mm':
      case 'yyyy-MM-dd HH:mm':
        return `${year}/${month}/${day}`
      case 'MM/dd/yyyy HH:mm':
        return `${month}/${day}/${year}`
      case 'dd/MM/yyyy HH:mm':
        return `${day}/${month}/${year}`
      default:
        return `${year}/${month}/${day}`
    }
  }

  // 通常の日時フォーマット（時間あり）
  switch (settings.dateFormat) {
    case 'yyyy/MM/dd HH:mm':
      return `${year}/${month}/${day} ${hours}:${minutes}`
    case 'yyyy-MM-dd HH:mm':
      return `${year}-${month}-${day} ${hours}:${minutes}`
    case 'MM/dd/yyyy HH:mm':
      return `${month}/${day}/${year} ${hours}:${minutes}`
    case 'dd/MM/yyyy HH:mm':
      return `${day}/${month}/${year} ${hours}:${minutes}`
    default:
      return `${year}/${month}/${day} ${hours}:${minutes}`
  }
}

/**
 * 日付文字列をパース
 * @param {string} dateString 日付文字列
 * @returns {Date|null} 日付オブジェクトまたはnull
 */
function parseDateString(dateString) {
  if (!dateString) return null

  try {
    const dateMatch = dateString.match(
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}/,
    )
    if (dateMatch) {
      return new Date(dateMatch[0])
    }

    return new Date(dateString)
  } catch (e) {
    console.error('日付の解析に失敗しました:', dateString, e)
    return null
  }
}

/**
 * GitHub上の日付表示を変換
 */
function convertGitHubDates() {
  const tzInfo = getTimezoneInfo()

  // 日付タグの処理
  processDateElements(tzInfo)

  // テキストノードの処理
  processTextNodes(tzInfo)

  // コミットグループヘッダーの処理
  processCommitGroupHeadings(tzInfo)
}

/**
 * 日付タグ要素を処理
 * @param {Object} tzInfo タイムゾーン情報
 */
function processDateElements(tzInfo) {
  const dateElements = [
    ...document.getElementsByTagName('relative-time'),
    ...document.getElementsByTagName('time-ago'),
  ]

  for (const element of dateElements) {
    if (element.hasAttribute('datetime')) {
      const elementText = element.textContent.toLowerCase().trim()
      const shadowText = element.shadowRoot
        ? element.shadowRoot.textContent.toLowerCase().trim()
        : ''
      const titleText = (element.getAttribute('title') || '').toLowerCase()

      if (
        elementText === 'now' ||
        shadowText === 'now' ||
        titleText.includes('now') ||
        elementText === 'just now' ||
        shadowText === 'just now' ||
        titleText.includes('just now')
      ) {
        continue
      }

      const originalDateTime = element.getAttribute('datetime')
      const date = new Date(originalDateTime)

      const now = new Date()
      const diffMs = Math.abs(now - date)
      if (diffMs < 60000) {
        continue
      }

      const originalTitle = element.getAttribute('title') || ''
      const formattedDate = formatDate(date)
      const tzDisplay =
        settings.showTimezone === 'none' ? '' : ` (${tzInfo.text})`

      // ツールチップの更新
      if (tzInfo.text) {
        element.setAttribute(
          'title',
          `${originalTitle}\n（${tzInfo.text}: ${formattedDate}）`,
        )
      } else {
        element.setAttribute('title', `${originalTitle}\n（${formattedDate}）`)
      }

      // 表示テキストの更新
      const displayText = `${formattedDate}${tzDisplay}`
      element.innerHTML = displayText

      // Shadow DOMの処理
      if (element.shadowRoot) {
        element.shadowRoot.innerHTML = displayText
      }
    }
  }
}

/**
 * テキストノードの日付を処理
 * @param {Object} tzInfo タイムゾーン情報
 */
function processTextNodes(tzInfo) {
  const textNodes = []
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false,
  )

  // 対象テキストノードの収集
  let node = walker.nextNode()
  while (node) {
    const text = node.nodeValue.trim()
    if (
      (text.includes('committed') || text.includes(' on ')) &&
      /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}\b/.test(
        text,
      )
    ) {
      textNodes.push(node)
    }
    node = walker.nextNode()
  }

  // テキストノードの更新
  for (const textNode of textNodes) {
    const originalText = textNode.nodeValue
    const date = parseDateString(originalText)
    if (!date) continue

    const formattedDate = formatDate(date)
    const tzDisplay =
      settings.showTimezone === 'none' ? '' : ` (${tzInfo.text})`

    const newText = originalText.replace(
      /(committed|on)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}/,
      `$1 ${formattedDate}${tzDisplay}`,
    )

    textNode.nodeValue = newText
  }
}

/**
 * コミットグループのヘッダーを処理
 * @param {Object} tzInfo タイムゾーン情報
 */
function processCommitGroupHeadings(tzInfo) {
  const commitGroupHeadings = document.querySelectorAll(
    '[data-testid="commit-group-title"]',
  )

  for (const heading of commitGroupHeadings) {
    const originalText = heading.textContent
    if (originalText.startsWith('Commits on ')) {
      const date = parseDateString(originalText)
      if (date) {
        // 「Commits on」の場合は日付のみ表示（時間なし）
        const formattedDate = formatDate(date, true)
        const tzDisplay =
          settings.showTimezone === 'none' ? '' : ` (${tzInfo.text})`
        heading.textContent = `Commits on ${formattedDate}${tzDisplay}`
      }
    }
  }
}

/**
 * 新しい時間表示要素を検出する監視設定
 */
function setupObserver() {
  const observer = new MutationObserver((mutations) => {
    if (shouldUpdateDates(mutations)) {
      // 変更検出後、少し遅延させて処理（DOMの変更が完了するのを待つ）
      setTimeout(convertGitHubDates, 100)
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  })

  return observer
}

/**
 * DOM変更があった場合に日付更新が必要かどうかを判断
 * @param {MutationRecord[]} mutations 変更レコード
 * @returns {boolean} 更新が必要かどうか
 */
function shouldUpdateDates(mutations) {
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      // 時間関連要素の追加を検出
      const timeElements = [...mutation.addedNodes]
        .filter((node) => node.nodeType === Node.ELEMENT_NODE)
        .flatMap((node) => {
          if (
            node.nodeName === 'RELATIVE-TIME' ||
            node.nodeName === 'TIME-AGO'
          ) {
            return [node]
          }
          const commitGroupHeadings = node.querySelectorAll
            ? [...node.querySelectorAll('[data-testid="commit-group-title"]')]
            : []

          return [
            ...commitGroupHeadings,
            ...(node.querySelectorAll
              ? [...node.querySelectorAll('relative-time, time-ago')]
              : []),
          ]
        })

      if (timeElements.length > 0) {
        return true
      }

      // 日付を含むテキストノードの追加を検出
      for (const addedNode of mutation.addedNodes) {
        if (addedNode.nodeType === Node.TEXT_NODE) {
          const text = addedNode.nodeValue.trim()
          if (
            (text.includes('committed') || text.includes(' on ')) &&
            /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}\b/.test(
              text,
            )
          ) {
            return true
          }
        }
      }
    }
  }
  return false
}

// 設定変更の監視
chrome.storage.onChanged.addListener((changes) => {
  if (changes.timezone || changes.dateFormat || changes.showTimezone) {
    loadSettings().then(() => {
      convertGitHubDates()
    })
  }
})

// 初期化処理
;(async function init() {
  await loadSettings()
  convertGitHubDates()
  setupObserver()
})()
