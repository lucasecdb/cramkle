import { Trans, t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import { ReactComponent as Logo } from '../../assets/logo-white.svg'
import LoginForm from '../forms/LoginForm'

const LoginPage: React.FunctionComponent = () => {
  const { i18n } = useLingui()

  return (
    <div className="flex flex-col min-h-screen w-full p-4 items-center justify-center bg-primary text-on-primary">
      <Helmet>
        <title>{i18n._(t`Login`)}</title>
      </Helmet>

      <Logo className="w-16 mb-8" />

      <LoginForm />

      <span className="mt-4">
        <Trans>
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-on-primary">
            Sign Up
          </Link>
        </Trans>
      </span>
    </div>
  )
}

export default LoginPage