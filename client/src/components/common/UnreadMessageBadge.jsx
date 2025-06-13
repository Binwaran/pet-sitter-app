import React from 'react'

export default function UnreadMessageBadge({ count, size = 'sm' }) {
  if (!count || count < 1) return null

  const badgeSize = size === 'lg' ? 'w-6 h-6 text-sm' : 'w-4 h-4 text-xs'

  return (
    <div
      className={`bg-orange-500 rounded-full ${
      size === 'lg' ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'
    }`}
    >
    </div>
  )
}