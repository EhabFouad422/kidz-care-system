'use client'

import { useEffect } from 'react'

export function LottieLoading({ size = 280 }: { size?: number }) {
  useEffect(() => {
    if (!customElements.get('dotlottie-wc')) {
      import('@lottiefiles/dotlottie-wc')
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2">
      {/* @ts-expect-error web component */}
      <dotlottie-wc
        src="https://lottie.host/9ede8a15-bd5b-443e-92f6-e75688defc91/fb0Wy85Xzr.lottie"
        style={{ width: size, height: size }}
        autoplay
        loop
      />
    </div>
  )
}
