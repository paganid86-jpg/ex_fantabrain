import { useState, useEffect, useRef } from 'react'

export default function useScrollDirection(threshold = 10) {
  const [isScrollingDown, setIsScrollingDown] = useState(false)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const pageContent = document.querySelector('.page-content')
    if (!pageContent) return

    const handleScroll = () => {
      if (ticking.current) return
      ticking.current = true

      requestAnimationFrame(() => {
        const currentY = pageContent.scrollTop
        const diff = currentY - lastScrollY.current

        if (Math.abs(diff) > threshold) {
          setIsScrollingDown(diff > 0)
          lastScrollY.current = currentY
        }

        ticking.current = false
      })
    }

    pageContent.addEventListener('scroll', handleScroll, { passive: true })
    return () => pageContent.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return isScrollingDown
}
