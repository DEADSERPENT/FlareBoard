import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { User, Bell, Shield, Palette, Key, Trash2, Sun, Moon, Monitor, Mail, Globe, BellRing, Lock, Image, Save, RotateCcw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { TrashModal } from '@/components/TrashModal'
import { API_BASE } from '@/lib/api'

export const SettingsPage = () => {
  const { token } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [preferences, setPreferences] = useState<any>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showTrashModal, setShowTrashModal] = useState(false)

  // Profile form
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Fetch user profile
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setUser(data.data)
        setFullName(data.data.fullName)
        setAvatarUrl(data.data.avatarUrl || '')
        setPreferences(data.data.preferences)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  const handleUpdateProfile = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName, avatarUrl: avatarUrl || null }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Success', 'Profile updated successfully')
        await fetchProfile()
      } else {
        toast.error('Error', data.error?.message || 'Failed to update profile')
      }
    } catch (error) {
      toast.error('Error', 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Validation Error', 'Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Validation Error', 'Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Success', 'Password changed successfully')
        setShowPasswordModal(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error('Error', data.error?.message || 'Failed to change password')
      }
    } catch (error) {
      toast.error('Error', 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePreferences = async (updates: any) => {
    try {
      const response = await fetch(`${API_BASE}/users/preferences`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      })

      const data = await response.json()
      if (data.success) {
        setPreferences(data.data)
        toast.success('Success', 'Preferences updated')
      }
    } catch (error) {
      toast.error('Error', 'Failed to update preferences')
    }
  }

  const handleThemeChange = (theme: string) => {
    handleUpdatePreferences({ theme })
  }

  const handleNotificationToggle = (key: string, value: boolean) => {
    const currentNotifications = preferences?.notifications || {}
    handleUpdatePreferences({
      notifications: {
        ...currentNotifications,
        [key]: value,
      },
    })
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Settings</h1>
        <p className="text-neutral-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">Profile</h2>
            <p className="text-sm text-neutral-600">Update your personal information</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 mb-2">
                <User className="w-4 h-4 text-neutral-400" />
                Full Name
              </label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 mb-2">
                <Mail className="w-4 h-4 text-neutral-400" />
                Email
              </label>
              <Input type="email" value={user.email} disabled />
            </div>
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 mb-2">
              <Image className="w-4 h-4 text-neutral-400" />
              Avatar URL (optional)
            </label>
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => fetchProfile()}>
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            <Button variant="primary" onClick={handleUpdateProfile} disabled={loading}>
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Palette className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">Appearance</h2>
            <p className="text-sm text-neutral-600">Customize your dashboard theme</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">Color Theme</label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'light', label: 'Light',  icon: Sun,     iconColor: 'text-amber-500',   bg: 'bg-amber-50' },
                { value: 'dark',  label: 'Dark',   icon: Moon,    iconColor: 'text-indigo-500',  bg: 'bg-indigo-50' },
                { value: 'auto',  label: 'System', icon: Monitor, iconColor: 'text-neutral-500', bg: 'bg-neutral-100' },
              ].map(({ value, label, icon: ThemeIcon, iconColor, bg }) => (
                <button
                  key={value}
                  onClick={() => handleThemeChange(value)}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    preferences?.theme === value
                      ? 'border-primary-500 shadow-sm'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                      <ThemeIcon className={`w-4 h-4 ${iconColor}`} />
                    </div>
                    {preferences?.theme === value && <Badge variant="orange">Active</Badge>}
                  </div>
                  <span className="text-sm font-medium text-neutral-900">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">Notifications</h2>
            <p className="text-sm text-neutral-600">Manage notification preferences</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { key: 'email', label: 'Email Notifications', description: 'Receive email updates for important events', icon: Mail },
            { key: 'push',  label: 'Push Notifications',  description: 'Browser push notifications',               icon: Globe },
            { key: 'inApp', label: 'In-App Notifications', description: 'Notifications within the application',    icon: BellRing },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">{item.label}</p>
                  <p className="text-sm text-neutral-600">{item.description}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={preferences?.notifications?.[item.key] || false}
                  onChange={(e) => handleNotificationToggle(item.key, e.target.checked)}
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          ))}
        </div>
      </Card>

      {/* Security */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">Security</h2>
            <p className="text-sm text-neutral-600">Manage your security settings</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setShowPasswordModal(true)}
            >
              <Key className="w-5 h-5" />
              Change Password
            </Button>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">Data Management</h2>
            <p className="text-sm text-neutral-600">Manage your deleted items</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setShowTrashModal(true)}
            >
              <Trash2 className="w-5 h-5 mr-2" />
              View Trash
            </Button>
            <p className="text-xs text-neutral-500 mt-2 ml-1">
              Restore or permanently delete items from trash
            </p>
          </div>
        </div>
      </Card>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <div className="space-y-4">
          {[
            { label: 'Current Password', value: currentPassword, onChange: setCurrentPassword, placeholder: 'Enter current password' },
            { label: 'New Password',     value: newPassword,     onChange: setNewPassword,     placeholder: 'Enter new password' },
            { label: 'Confirm Password', value: confirmPassword, onChange: setConfirmPassword, placeholder: 'Confirm new password' },
          ].map(({ label, value, onChange, placeholder }) => (
            <div key={label}>
              <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 mb-2">
                <Lock className="w-4 h-4 text-neutral-400" />
                {label}
              </label>
              <Input
                type="password"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
              />
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowPasswordModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleChangePassword} disabled={loading}>
              {loading ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Trash Modal */}
      <TrashModal
        isOpen={showTrashModal}
        onClose={() => setShowTrashModal(false)}
      />
    </div>
  )
}
