document.getElementById('save-button').addEventListener('click', saveOptions)

function saveOptions() {
  const timezone = document.getElementById('timezone-select').value
  const dateFormat = document.getElementById('date-format').value
  const showTimezone = document.getElementById('show-timezone').value

  chrome.storage.sync.set(
    {
      timezone,
      dateFormat,
      showTimezone,
    },
    () => {
      const status = document.getElementById('status')
      status.textContent = '設定を保存しました。'
      status.classList.add('success')
      status.style.display = 'block'

      setTimeout(() => {
        status.style.display = 'none'
      }, 3000)
    },
  )
}

function loadOptions() {
  chrome.storage.sync.get(
    {
      timezone: 'auto',
      dateFormat: 'yyyy/MM/dd HH:mm',
      showTimezone: 'none',
    },
    (items) => {
      document.getElementById('timezone-select').value = items.timezone
      document.getElementById('date-format').value = items.dateFormat
      document.getElementById('show-timezone').value = items.showTimezone
    },
  )
}

document.addEventListener('DOMContentLoaded', loadOptions)
