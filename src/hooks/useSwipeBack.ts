import { useEffect, useRef } from 'react'

interface SwipeConfig {
  onSwipeBack: () => void
  minSwipeDistance?: number
  maxStartDistance?: number
  maxTime?: number
}

export const useSwipeBack = ({ 
  onSwipeBack, 
  minSwipeDistance = 100, 
  maxStartDistance = 50, 
  maxTime = 500 
}: SwipeConfig) => {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      const rect = container.getBoundingClientRect()
      const startX = touch.clientX - rect.left

      // Only start tracking if touch starts within maxStartDistance from left edge
      if (startX <= maxStartDistance) {
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now()
        }
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return

      const touch = e.changedTouches[0]
      const endTime = Date.now()
      const timeDiff = endTime - touchStartRef.current.time

      // Check if gesture was completed within time limit
      if (timeDiff > maxTime) {
        touchStartRef.current = null
        return
      }

      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y)

      // Check if it's a valid horizontal swipe to the right
      const isValidSwipe = 
        deltaX > minSwipeDistance && // Moved right enough
        deltaY < minSwipeDistance / 2 && // Not too much vertical movement
        deltaX > deltaY * 2 // Horizontal movement dominates

      if (isValidSwipe) {
        onSwipeBack()
      }

      touchStartRef.current = null
    }

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent default scrolling during potential swipe
      if (touchStartRef.current) {
        const touch = e.touches[0]
        const deltaX = touch.clientX - touchStartRef.current.x
        
        // If moving right significantly, prevent default scroll
        if (deltaX > 20) {
          e.preventDefault()
        }
      }
    }

    // Add passive: false to allow preventDefault
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onSwipeBack, minSwipeDistance, maxStartDistance, maxTime])

  return containerRef
}
