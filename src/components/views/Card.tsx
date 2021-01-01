import classnames from 'classnames'
import { useRef, useState } from 'react'
import * as React from 'react'

export interface CardPressableProps extends React.HTMLProps<HTMLDivElement> {
  'aria-describedby': string
}

export const CardPressable: React.FunctionComponent<CardPressableProps> = ({
  className = '',
  style,
  children,
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null)

  const [focused, setFocused] = useState(false)
  const [hovered, setHovered] = useState(false)

  const handleMouseEnter: React.MouseEventHandler<HTMLDivElement> = (evt) => {
    setHovered(true)
    props.onMouseEnter?.(evt)
  }

  const handleMouseLeave: React.MouseEventHandler<HTMLDivElement> = (evt) => {
    setHovered(false)
    props.onMouseLeave?.(evt)
  }

  const handleFocus: React.FocusEventHandler<HTMLDivElement> = (evt) => {
    setFocused(true)
    props.onFocus?.(evt)
  }

  const handleBlur: React.FocusEventHandler<HTMLDivElement> = (evt) => {
    setFocused(false)
    props.onBlur?.(evt)
  }

  const classes = classnames(
    'flex flex-col relative outline-none cursor-pointer',
    className
  )

  return (
    <div
      className={classes}
      ref={ref}
      style={style}
      tabIndex={0}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    >
      {children}
      <div
        className={classnames(
          'absolute z-1 top-0 left-0 right-0 bottom-0 bg-hover-overlay transition-opacity ease-in-out duration-200 rounded-xl',
          {
            'opacity-0': !hovered && !focused,
            'opacity-100': hovered || focused,
          }
        )}
      />
    </div>
  )
}

export type CardProps = React.HTMLProps<HTMLDivElement>

export const Card: React.FunctionComponent<CardProps> = ({
  children,
  className = '',
  ...otherProps
}) => {
  return (
    <div
      className={classnames(
        'bg-surface text-on-surface rounded-xl shadow border-2 border-divider',
        className
      )}
      {...otherProps}
    >
      {children}
    </div>
  )
}

export const CardContent: React.FC<React.HTMLProps<HTMLDivElement>> = (
  props
) => {
  return (
    <div {...props} className={classnames(props.className, 'px-4 py-4')}>
      {props.children}
    </div>
  )
}
