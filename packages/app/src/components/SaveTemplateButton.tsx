import { useMutation } from '@apollo/react-hooks'
import { Trans } from '@lingui/macro'
import { RawDraftContentState } from 'draft-js'
import gql from 'graphql-tag'
import React, { useState } from 'react'

import Button from './views/Button'
import {
  UpdateContentStateMutation,
  UpdateContentStateMutationVariables,
} from './__generated__/UpdateContentStateMutation'

type Props = RawDraftContentState & { id: string }

const UPDATE_CONTENT_STATE_MUTATION = gql`
  mutation UpdateContentStateMutation(
    $id: ID!
    $contentState: ContentStateInput
  ) {
    updateContentState(id: $id, contentState: $contentState) {
      id
    }
  }
`

const SaveTemplateButton: React.FunctionComponent<Props> = ({
  id,
  blocks,
  entityMap,
}) => {
  const [mutate] = useMutation<
    UpdateContentStateMutation,
    UpdateContentStateMutationVariables
  >(UPDATE_CONTENT_STATE_MUTATION)

  const [loading, setLoading] = useState(false)

  return (
    <Button
      onClick={() => {
        setLoading(true)
        mutate({
          variables: { id, contentState: { blocks, entityMap } },
        }).finally(() => setLoading(false))
      }}
      disabled={loading}
      dense
    >
      <Trans>Save Template</Trans>
    </Button>
  )
}

export default SaveTemplateButton
