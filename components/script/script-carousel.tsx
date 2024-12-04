'use client'

import React from 'react'
import Image from 'next/image'

interface ScriptCarouselProps {
  screenshots: string[]
}

export function ScriptCarousel({ screenshots }: ScriptCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = React.useState(true)

  React.useEffect(() => {
    if (!isAutoPlaying) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % screenshots.length)
    }, 3000)

    return () => clearInterval(timer)
  }, [isAutoPlaying, screenshots.length])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-lg border border-[--border] aspect-[16/9] relative">
        <Image 
          src={screenshots[currentIndex]} 
          alt={`截图 ${currentIndex + 1}`}
          fill
          className="object-contain"
          unoptimized
        />
        <button 
          onClick={() => goToSlide((currentIndex - 1 + screenshots.length) % screenshots.length)}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          ←
        </button>
        <button 
          onClick={() => goToSlide((currentIndex + 1) % screenshots.length)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          →
        </button>
      </div>
      <div className="flex gap-2 mt-4 justify-center">
        {screenshots.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-[--primary]' : 'bg-[--border]'
            }`}
          />
        ))}
      </div>
    </div>
  )
} 