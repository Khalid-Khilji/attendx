import { useForm } from '@tanstack/react-form'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { Modal, Input, Button } from '../index'

const Login = ({ isOpen, onClose }) => {
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log('Login Data:', value)
      onClose()
    },
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="py-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to your account</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="flex flex-col gap-4"
        >
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'Email is required'
                if (!/^\S+@\S+\.\S+$/.test(value)) return 'Invalid email format'
                return undefined
              },
            }}
            children={(field) => (
              <Input
                label="Email"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(val) => field.handleChange(val)}
                error={field.state.meta.touchedErrors?.[0]}
                placeholder="name@company.com"
                icon={Mail}
              />
            )}
          />

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'Password is required'
                if (value.length < 6) return 'Minimum 6 characters'
                return undefined
              },
            }}
            children={(field) => (
              <Input
                label="Password"
                type="password"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(val) => field.handleChange(val)}
                error={field.state.meta.touchedErrors?.[0]}
                placeholder="••••••••"
                icon={Lock}
              />
            )}
          />

          <div className="flex justify-end">
            <button 
              type="button" 
              className="text-xs font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit}
                isLoading={isSubmitting}
                variant="primary"
                size="lg"
                className="mt-2 font-semibold"
                icon={ArrowRight}
                iconPosition="right"
              >
                Sign In
              </Button>
            )}
          />

          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
            Secure login for Attendx members
          </p>
        </form>
      </div>
    </Modal>
  )
}

export default Login