export type PropsWithCSS<T> = {
  className?: string
  style?: React.CSSProperties
} & T
