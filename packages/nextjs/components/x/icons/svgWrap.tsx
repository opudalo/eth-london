import { classes } from '@grammarly/focal'
import { PropsWithChildren } from 'react'
import { IconProps } from '.'

export const SVGWrap: React.FC<
  PropsWithChildren<
    IconProps & {
      viewBox: string
    }
  >
> = ({ children, className, viewBox, width, height, size, style }) => {
  const values = viewBox.split(/[\s,]+/).map(Number) as [
    number,
    number,
    number,
    number
  ]
  const defaultWidth = values[2]
  const defaultHeight = values[3]
  const isSquare = defaultWidth === defaultHeight

  if (!isSquare && size) {
    throw new Error('size can only be used with square icons')
  }

  let w: number
  let h: number
  if (isSquare) {
    w = h = size ?? width ?? height ?? defaultWidth
  } else {
    w = width || defaultWidth * (height ? height / defaultHeight : 1)
    h = height || defaultHeight * (width ? width / defaultWidth : 1)
  }

  return (
    <svg
      width={w}
      height={h}
      viewBox={viewBox}
      {...classes(className)}
      {...(!!style ? { style } : {})}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  )
}
