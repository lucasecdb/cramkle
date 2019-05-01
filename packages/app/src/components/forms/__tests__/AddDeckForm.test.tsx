import React from 'react'
import { render as rtlRender, fireEvent, wait } from 'react-testing-library'
import { MockedProvider, MockedResponse } from 'react-apollo/test-utils'

import createDeckMutation from '../../../graphql/createDeckMutation.gql'
import AddDeckForm from '../AddDeckForm'

interface Options {
  mutationMocks?: MockedResponse[]
}

const render = (ui: React.ReactElement, options: Options = {}) => {
  const deckMock = {
    id: 'id',
    slug: 'id',
    title: 'my title',
  }

  const {
    mutationMocks = [
      {
        request: {
          query: createDeckMutation,
          variables: {
            title: deckMock.title,
          },
        },
        result: {
          data: {
            createDeck: deckMock,
          },
        },
      },
    ],
  } = options

  const utils = rtlRender(
    <MockedProvider mocks={mutationMocks}>{ui}</MockedProvider>
  )

  return {
    ...utils,
    deckMock,
  }
}

describe('<AddDeckForm />', () => {
  it('should add deck on submit click', async () => {
    const closeCallback = jest.fn()
    const { getByLabelText, getByText, deckMock } = render(
      <AddDeckForm open onClose={closeCallback} />
    )

    const titleInput = getByLabelText(/title/i)
    const submitButton = getByText(/create/i)

    fireEvent.input(titleInput, { target: { value: deckMock.title } })
    fireEvent.click(submitButton)

    await wait(() => expect(closeCallback).toHaveBeenCalledTimes(1))
  })

  it.skip('should add one deck on input enter', async () => {
    const closeCallback = jest.fn()
    const { getByLabelText, deckMock } = render(
      <AddDeckForm open onClose={closeCallback} />
    )

    const titleInput = getByLabelText(/title/i)

    fireEvent.input(titleInput, { target: { value: deckMock.title } })
    fireEvent.keyPress(titleInput, { key: 'Enter', code: 13 })

    await wait(() => expect(closeCallback).toHaveBeenCalledTimes(1))
  })
})