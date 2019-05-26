import {
  Editor,
  EditorState,
  RawDraftContentState,
  RichUtils,
  convertFromRaw,
} from 'draft-js'
import 'draft-js/dist/Draft.css'
import React, { useCallback, useEffect, useState } from 'react'
import { TabController } from 'react-tab-controller'

import InlineStyleControls from 'components/editor/InlineStyleControls'
import BlockStyleControls from 'components/editor/BlockStyleControls'
import Card, { CardActionButtons, CardActions } from 'views/Card'

interface Props {
  className?: string
  initialContentState?: any
  onChange?: (state: EditorState) => void
}

const FieldValueEditor: React.FC<Props> = ({
  className,
  onChange,
  initialContentState,
}) => {
  const [editor, setEditor] = useState(() => {
    if (!initialContentState || initialContentState.blocks.length === 0) {
      return EditorState.createEmpty()
    }

    const contentState = convertFromRaw(
      initialContentState as RawDraftContentState
    )

    return EditorState.createWithContent(contentState)
  })

  useEffect(() => {
    onChange && onChange(editor)
  }, [editor, onChange])

  const handleStyleToggle = useCallback(
    (style: string) => {
      setEditor(RichUtils.toggleInlineStyle(editor, style))
    },
    [editor]
  )

  const handleBlockStyleToggle = useCallback(
    (style: string) => {
      setEditor(RichUtils.toggleBlockType(editor, style))
    },
    [editor]
  )

  return (
    <Card outlined className={className}>
      <CardActions className="bb b--inherit">
        <CardActionButtons className="flex-column items-start">
          <TabController>
            <BlockStyleControls
              editor={editor}
              onToggle={handleBlockStyleToggle}
            />
          </TabController>
          <TabController>
            <InlineStyleControls editor={editor} onToggle={handleStyleToggle} />
          </TabController>
        </CardActionButtons>
      </CardActions>
      <div className="pa3">
        <Editor editorState={editor} onChange={setEditor} />
      </div>
    </Card>
  )
}

export default FieldValueEditor
