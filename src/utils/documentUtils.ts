/**
 * Format file size from bytes to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB", "1.2 KB")
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes === 0) return '0 KB'
  if (isNaN(bytes)) return '0 KB'

  const kb = bytes / 1024
  const mb = kb / 1024

  if (mb >= 1) {
    return `${mb.toFixed(1)} MB`
  } else {
    return `${kb.toFixed(1)} KB`
  }
}

/**
 * Format upload date to relative time or date string
 * @param dateString - ISO date string
 * @returns Formatted date (e.g., "Today", "Yesterday", "Jan 15, 2024")
 */
export function formatUploadDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Unknown date'

  try {
    const date = new Date(dateString)

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const uploadDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    // Check if today
    if (uploadDate.getTime() === today.getTime()) {
      return 'Today'
    }

    // Check if yesterday
    if (uploadDate.getTime() === yesterday.getTime()) {
      return 'Yesterday'
    }

    // Check if within last 7 days
    const daysDiff = Math.floor((today.getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff < 7 && daysDiff > 0) {
      return `${daysDiff} day${daysDiff === 1 ? '' : 's'} ago`
    }

    // Format as date for older items
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}

/**
 * Get file type extension from filename
 * @param filename - File name with extension
 * @returns Uppercase file extension (e.g., "PDF", "DOCX")
 */
export function getFileExtension(filename: string | null | undefined): string {
  if (!filename) return 'FILE'

  const parts = filename.split('.')
  if (parts.length < 2) return 'FILE'

  return parts[parts.length - 1].toUpperCase()
}
