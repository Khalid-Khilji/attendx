import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { Modal, Input, Button } from '../index'
import { login as loginApi } from '../../api/auth'
import { getAllDepartments, getAllAcademicYears } from '../../api/index'
import useAuthStore from '../../stores/auth'
import useAdminStore from '../../stores/admin'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const Login = ({ isOpen, onClose }) => {
  const { login } = useAuthStore()
  const { setDepartments, setAcademicYears } = useAdminStore()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (response) => {
      const { access_token, user } = response
      if (access_token && user) {
        login(user, access_token)
        setError('')
        onClose()

        if (user.role === 'admin') {
          navigate('/admin/dashboard')
          Promise.all([getAllDepartments(), getAllAcademicYears()]).then(([depts, years]) => {
            setDepartments(depts)
            setAcademicYears(years)
          })
        } else {
          navigate(`/${user.role}/dashboard`)
        }
      }
    },
    onError: (err) => {
      setError(err.error || err.message || 'Invalid email or password')
    }
  })

  const form = useForm({
    defaultValues: { email: '', password: '' },
    onSubmit: async ({ value }) => mutation.mutate(value),
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="py-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">Welcome <span className="text-violet-600">Back</span></h2>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-1">Enter credentials to access portal</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
            <AlertCircle size={14} className="text-red-500 shrink-0" />
            <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">{error}</p>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }} className="flex flex-col gap-5">
          <form.Field name="email">
            {(field) => (
              <Input
                label="Email" id={field.name} name={field.name}
                value={field.state.value} onChange={field.handleChange}
                autoComplete="email" icon={Mail} required
                placeholder="teacher@mhssce.ac.in"
              />
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <Input
                label="Password" type="password" id={field.name} name={field.name}
                value={field.state.value} onChange={field.handleChange}
                autoComplete="current-password" icon={Lock} required
                placeholder="Enter your password"
              />
            )}
          </form.Field>

          <Button
            type="submit"
            variant="primary"
            className="py-3 w-full h-12 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-violet-600/20"
            isLoading={mutation.isPending}
            icon={ArrowRight}
            iconPosition="right"
          >
            Sign In
          </Button>
        </form>
      </div>
    </Modal>
  )
}

export default Login