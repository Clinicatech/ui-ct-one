/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

// Para assets
declare module '*.svg' {
    import React from 'react'
    const content: React.FC<React.SVGProps<SVGSVGElement>>
    export default content
  }
  
  declare module '*.png' {
    const value: string
    export default value
  }