import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'motion/react'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { Modal, Input, Button, Loader } from '../index'
import { login as loginApi } from '../../api/auth'
import useAuthStore from '../../stores/auth'
import { useNavigate } from 'react-router-dom'

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
}

const Login = ({ isOpen, onClose }) => {
  const { login } = useAuthStore()
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (response) => {
      const { access_token, user } = response
      if (access_token && user) {
        login(user, access_token)
        onClose()
        if (user?.role === "admin") {
          navigate('/admin/dashboard');
        } else if (user?.role === "teacher") {
          navigate('/teacher/dashboard');
        } else if (user?.role === "student") {
          navigate('/student/dashboard');
        }
      }
    },
    onError: (error) => {
      console.error(error?.message || error)
    }
  })

  const form = useForm({
    defaultValues: { email: '', password: '' },
    onSubmit: async ({ value }) => {
      mutation.mutate(value)
    },
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="py-4 min-h-100 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {mutation.isPending ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center"
            >
              <Loader text="Checking records..." size="lg" />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="text-center mb-8">
                <motion.h2
                  variants={itemVariants}
                  className="text-2xl font-bold text-zinc-900 dark:text-white"
                >
                  Welcome Back
                </motion.h2>
                <motion.p
                  variants={itemVariants}
                  className="text-sm text-zinc-500 dark:text-zinc-400 mt-1"
                >
                  Enter your credentials to continue
                </motion.p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  form.handleSubmit()
                }}
                className="flex flex-col gap-5"
              >
                <motion.div variants={itemVariants}>
                  <form.Field
                    name="email"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value) return 'Email is required'
                        if (!/^\S+@\S+\.\S+$/.test(value)) return 'Invalid format'
                        return undefined
                      },
                    }}
                    children={(field) => (
                      <Input
                        label="Email Address"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(val) => field.handleChange(val)}
                        error={field.state.meta.touchedErrors?.[0]}
                        autoComplete="email"
                        placeholder="name@company.com"
                        icon={Mail}
                      />
                    )}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <form.Field
                    name="password"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value) return 'Password is required'
                        if (value.length < 6) return 'Min 6 characters'
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
                        autoComplete="off"
                        error={field.state.meta.touchedErrors?.[0]}
                        placeholder="••••••••"
                        icon={Lock}
                      />
                    )}
                  />
                </motion.div>

                {mutation.isError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-3 rounded-xl"
                  >
                    <p className="text-xs text-red-600 dark:text-red-400 font-bold text-center">
                      {mutation.error?.response?.data?.detail || "Invalid credentials"}
                    </p>
                  </motion.div>
                )}

                <motion.div variants={itemVariants} className="flex justify-end -mt-2">
                  <button type="button" className="text-xs font-bold text-violet-600 hover:text-violet-700">
                    Forgot password?
                  </button>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <form.Subscribe
                    selector={(state) => [state.canSubmit]}
                    children={([canSubmit]) => (
                      <Button
                        type="submit"
                        disabled={!canSubmit}
                        variant="primary"
                        className="mt-2 font-bold rounded-xl shadow-lg shadow-violet-500/20 py-3 w-full"
                        icon={ArrowRight}
                        iconPosition="right"
                      >
                        Sign In
                      </Button>
                    )}
                  />
                </motion.div>

                <motion.p
                  variants={itemVariants}
                  className="text-center text-[10px] uppercase tracking-widest text-zinc-400 font-black mt-2"
                >
                  Attendx Secure
                </motion.p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  )
}

export default Login