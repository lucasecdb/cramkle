import { Formik, Field } from 'formik'
import React from 'react'
import * as yup from 'yup'
import { graphql, ChildMutateProps } from 'react-apollo'
import { withRouter, RouteComponentProps } from 'react-router'
import Card, { CardActions, CardActionButtons } from '@material/react-card'
import Button from '@material/react-button'
import { Headline4 } from '@material/react-typography'

import registerMutation from '../../graphql/registerMutation.gql'
import { TextInput, CheckboxInput } from './Fields'

interface Props {
  title?: string
}

const RegisterForm: React.FunctionComponent<
  ChildMutateProps<Props> & RouteComponentProps
> = ({ mutate: register, title, history }) => (
  <Formik
    initialValues={{
      username: '',
      email: '',
      password: '',
      consent: false,
    }}
    validationSchema={yup.object().shape({
      username: yup
        .string()
        .min(4)
        .max(20)
        .matches(
          /^[\w_]+$/,
          'Username must consist only of alphanumeric characters and underscores'
        )
        .required('Username is required'),
      email: yup
        .string()
        .email()
        .required('E-mail is required'),
      password: yup
        .string()
        .min(6)
        .required('Password is required'),
      consent: yup
        .bool()
        .test('consent', 'Agreement is required', value => value === true)
        .required('Agreement is required'),
    })}
    onSubmit={user =>
      register({ variables: user }).then(() =>
        history.push('/login', { newUser: true })
      )
    }
  >
    {({ handleSubmit, isValid, isSubmitting }) => (
      <form className="register-page__form w-100" onSubmit={handleSubmit}>
        <Card
          className="register-page__form-content pa3 pb0 c-on-surface"
          outlined
        >
          <Headline4 className="tc f3 f2-ns">{title}</Headline4>
          <Field
            component={TextInput}
            className="mv2"
            name="username"
            label="Username"
          />
          <Field
            component={TextInput}
            className="mv2"
            name="email"
            label="E-mail"
          />
          <Field
            component={TextInput}
            className="mv2"
            label="Password"
            name="password"
            type="password"
          />
          <label className="flex items-center">
            <Field component={CheckboxInput} name="consent" />
            <span className="ml2">
              I agree to the {/* eslint-disable-next-line */}
              <a href="#" target="_blank">
                Terms & Conditions
              </a>
            </span>
          </label>
          <CardActions>
            <CardActionButtons>
              <Button raised disabled={!isValid || isSubmitting}>
                Register
              </Button>
            </CardActionButtons>
          </CardActions>
        </Card>
      </form>
    )}
  </Formik>
)

RegisterForm.defaultProps = {
  title: 'Register',
}

export default graphql<Props>(registerMutation)(withRouter(RegisterForm))
