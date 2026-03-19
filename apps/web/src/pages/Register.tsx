import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, Loader2, Boxes, Shield, BarChart2, Zap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE } from '../lib/api'

const perks = [
  { icon: Zap,      text: 'Up and running in minutes' },
  { icon: BarChart2, text: 'Built-in analytics and reporting' },
  { icon: Shield,   text: 'Secure, role-based permissions' },
]

export function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [fullName, setFullName]               = useState('')
  const [email, setEmail]                     = useState('')
  const [password, setPassword]               = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError]                     = useState('')
  const [loading, setLoading]                 = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const res  = await fetch(`${API_BASE}/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password, fullName }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.error?.message || 'Registration failed'); return }
      login(data.data.token, data.data.user)
      navigate('/')
    } catch {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left: Brand panel ─────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #1a0a00 0%, #2d1200 40%, #1c0900 100%)' }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
               style={{ background: 'radial-gradient(circle, #f97316, transparent 70%)' }} />
          <div className="absolute top-1/2 -right-24 w-72 h-72 rounded-full opacity-10"
               style={{ background: 'radial-gradient(circle, #fb923c, transparent 70%)' }} />
          <div className="absolute -bottom-24 left-1/3 w-64 h-64 rounded-full opacity-15"
               style={{ background: 'radial-gradient(circle, #ea580c, transparent 70%)' }} />
          <div className="absolute inset-0 opacity-[0.04]"
               style={{ backgroundImage: 'linear-gradient(rgba(249,115,22,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.5) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg">
            <Boxes className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">FlareBoard</span>
        </div>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-black text-white leading-tight tracking-tight mb-4">
              Join thousands<br />
              <span style={{ color: '#f97316' }}>of teams.</span>
            </h2>
            <p className="text-neutral-400 text-lg leading-relaxed max-w-sm">
              Create your free account and start managing projects the right way — today.
            </p>
          </div>

          <div className="space-y-4">
            {perks.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-500/15 border border-primary-500/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary-400" />
                </div>
                <span className="text-neutral-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative grid grid-cols-3 gap-4">
          {[['10k+', 'Users'], ['500+', 'Teams'], ['99.9%', 'Uptime']].map(([val, label]) => (
            <div key={label} className="text-center border border-white/10 rounded-xl py-4 bg-white/5">
              <p className="text-2xl font-black text-white">{val}</p>
              <p className="text-neutral-500 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Form panel ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-20 bg-white overflow-y-auto">
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <Boxes className="w-7 h-7 text-primary-500" />
          <span className="text-lg font-bold text-neutral-900">FlareBoard</span>
        </div>

        <div className="w-full max-w-sm mx-auto page-enter">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight mb-1">Create your account</h1>
            <p className="text-neutral-500 text-sm">Free forever. No credit card required.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm slide-up">
                {error}
              </div>
            )}

            {[
              { id: 'fullName', label: 'Full Name',    type: 'text',     icon: User, value: fullName,  set: setFullName,  placeholder: 'Jane Doe' },
              { id: 'email',    label: 'Email',        type: 'email',    icon: Mail, value: email,     set: setEmail,     placeholder: 'you@example.com' },
              { id: 'password', label: 'Password',     type: 'password', icon: Lock, value: password,  set: setPassword,  placeholder: '••••••••' },
              { id: 'confirm',  label: 'Confirm',      type: 'password', icon: Lock, value: confirmPassword, set: setConfirmPassword, placeholder: '••••••••' },
            ].map(({ id, label, type, icon: Icon, value, set, placeholder }) => (
              <div key={id} className="space-y-1.5">
                <label htmlFor={id} className="block text-xs font-semibold text-neutral-500 uppercase tracking-widest">
                  {label}
                </label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    id={id} type={type} value={value} required
                    onChange={e => set(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white focus:border-transparent transition-all"
                  />
                </div>
              </div>
            ))}

            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 px-4 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</> : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
