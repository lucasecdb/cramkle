import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { useEffect } from 'react'

import { useTheme } from '../components/Theme'
import {
  UpdateDarkMode,
  UpdateDarkModeVariables,
} from './__generated__/UpdateDarkMode'

const UPDATE_DARK_MODE_PREFERENCE = gql`
  mutation UpdateDarkMode($darkMode: Boolean!) {
    updatePreferences(input: { darkMode: $darkMode }) {
      user {
        id
        preferences {
          darkMode
        }
      }
    }
  }
`

export default function useDarkModePreferencesSync() {
  const { theme } = useTheme()

  const [updatePreferredTheme] = useMutation<
    UpdateDarkMode,
    UpdateDarkModeVariables
  >(UPDATE_DARK_MODE_PREFERENCE)

  useEffect(() => {
    updatePreferredTheme({ variables: { darkMode: theme === 'dark' } })
  }, [updatePreferredTheme, theme])
}