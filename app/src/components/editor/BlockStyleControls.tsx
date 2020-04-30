import { t } from '@lingui/macro'
import classnames from 'classnames'
import { ContentBlock, ContentState, EditorState, Modifier } from 'draft-js'
import React, { memo, useCallback } from 'react'

import styles from './BlockStyleControls.css'
import StyleButton, { Style } from './StyleButton'

export const BLOCK_TYPES: Style[] = [
  { label: t`H1`, style: 'header-one' },
  { label: t`H2`, style: 'header-two' },
  { label: t`H3`, style: 'header-three' },
  { label: t`H4`, style: 'header-four' },
  { label: t`H5`, style: 'header-five' },
  { label: t`H6`, style: 'header-six' },
  { label: t`Blockquote`, style: 'blockquote', icon: 'format_quote' },
  { label: t`UL`, style: 'unordered-list-item', icon: 'format_list_bulleted' },
  { label: t`OL`, style: 'ordered-list-item', icon: 'format_list_numbered' },
  { label: t`Code Block`, style: 'code-block' },
]

export const ALIGN_LEFT = 'alignLeft'
export const ALIGN_CENTER = 'alignCenter'
export const ALIGN_RIGHT = 'alignRight'

export const ALIGNMENT_STYLES: Style[] = [
  {
    label: t`Align left`,
    style: ALIGN_LEFT,
    icon: 'format_align_left',
  },
  {
    label: t`Align center`,
    style: ALIGN_CENTER,
    icon: 'format_align_center',
  },
  {
    label: t`Align right`,
    style: ALIGN_RIGHT,
    icon: 'format_align_right',
  },
]

export const ALIGNMENT_DATA_KEY = 'textAlignment'

const getAlignmentStyles = (blockAlignment: string) => {
  switch (blockAlignment) {
    case ALIGN_LEFT:
      return styles.alignLeft
    case ALIGN_CENTER:
      return styles.alignCenter
    case ALIGN_RIGHT:
      return styles.alignRight
  }
}

const getBlockTypeStyle = (blockType: string) => {
  switch (blockType) {
    case 'header-one':
      return 'text-4xl'
    case 'header-two':
      return 'text-3xl'
    case 'header-three':
      return 'text-2xl'
    case 'header-four':
      return 'text-xl'
    case 'header-five':
      return 'text-lg'
    case 'header-six':
      return 'text-base'
    case 'unordered-list-item':
      return 'list-disc'
    case 'ordered-list-item':
      return 'list-decimal'
    case 'blockquote':
      return 'border-l-4 border-muted pl-2 text-secondary'
    case 'code-block':
      return 'font-mono p-2 bg-muted'
  }
}

export const blockStyleFn = (contentBlock: ContentBlock) => {
  const blockData = contentBlock.getData()
  const blockType = contentBlock.getType()

  const blockAlignment = blockData.has(ALIGNMENT_DATA_KEY)
    ? blockData.get(ALIGNMENT_DATA_KEY)
    : undefined

  let alignmentStyle = ''

  if (blockAlignment) {
    alignmentStyle = getAlignmentStyles(blockAlignment)
  }

  const blockStyle = getBlockTypeStyle(blockType)

  return classnames(alignmentStyle, blockStyle)
}

const BlockStyleControls: React.FunctionComponent<{
  editor: EditorState
  onToggle: (s: string | ContentState) => void
}> = ({ editor, onToggle }) => {
  const selection = editor.getSelection()
  const selectionBlock = editor
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())

  const blockType = selectionBlock.getType()
  const blockData = selectionBlock.getData()

  const currentAlignment = blockData.has(ALIGNMENT_DATA_KEY)
    ? blockData.get(ALIGNMENT_DATA_KEY)
    : undefined

  const handleToggleAlignment = useCallback(
    (style: string) => {
      onToggle(
        Modifier.mergeBlockData(
          editor.getCurrentContent(),
          selection,
          blockData.set(
            ALIGNMENT_DATA_KEY,
            currentAlignment !== style ? style : undefined
          )
        )
      )
    },
    [onToggle, blockData, editor, selection, currentAlignment]
  )

  return (
    <div className="mb-2 text-sm flex flex-wrap">
      {BLOCK_TYPES.map((type) => (
        <StyleButton
          key={type.style}
          active={type.style === blockType}
          label={type.label}
          onToggle={onToggle}
          style={type.style}
          icon={type.icon}
        />
      ))}
      {ALIGNMENT_STYLES.map((alignmentStyle) => (
        <StyleButton
          key={alignmentStyle.style}
          style={alignmentStyle.style}
          label={alignmentStyle.label}
          icon={alignmentStyle.icon}
          onToggle={handleToggleAlignment}
          active={currentAlignment === alignmentStyle.style}
        />
      ))}
    </div>
  )
}

export default memo(BlockStyleControls)
