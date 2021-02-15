declare module '*.svg' {
  import { ComponentType, SVGAttributes } from 'react'

  export const ReactComponent: ComponentType<SVGAttributes>

  export const url: string
}

declare module '*.woff2' {
  const url: string

  export default url
}
