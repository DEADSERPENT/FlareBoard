import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { User, Bell, Shield, Palette, Key } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'

export const SettingsPage = () => {
  const { token } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [preferences, setPreferences] = useState<any>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

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
      const response = await fetch('http://localhost:3000/api/users/profile', {
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
      const response = await fetch('http://localhost:3000/api/users/profile', {
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
      const response = await fetch('http://localhost:3000/api/users/change-password', {
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
      const response = await fetch('http://localhost:3000/api/users/preferences', {
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
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input label="Email" type="email" value={user.email} disabled />
          </div>
          <Input
            label="Avatar URL (optional)"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => fetchProfile()}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdateProfile} disabled={loading}>
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
              <button
                onClick={() => handleThemeChange('light')}
                className={`p-4 border-2 rounded-lg bg-white ${
                  preferences?.theme === 'light' ? 'border-primary-500' : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-900">Light</span>
                  {preferences?.theme === 'light' && <Badge variant="orange">Active</Badge>}
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded bg-white border-2 border-neutral-200" />
                  <div className="w-8 h-8 rounded bg-primary-500" />
                </div>
              </button>

              <button
                onClick={() => handleThemeChange('dark')}
                className={`p-4 border-2 rounded-lg bg-white ${
                  preferences?.theme === 'dark' ? 'border-primary-500' : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-900">Dark</span>
                  {preferences?.theme === 'dark' && <Badge variant="orange">Active</Badge>}
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded bg-neutral-900" />
                  <div className="w-8 h-8 rounded bg-primary-500" />
                </div>
              </button>

              <button
                onClick={() => handleThemeChange('auto')}
                className={`p-4 border-2 rounded-lg bg-white ${
                  preferences?.theme === 'auto' ? 'border-primary-500' : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-900">Auto</span>
                  {preferences?.theme === 'auto' && <Badge variant="orange">Active</Badge>}
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-white to-neutral-900 border border-neutral-200" />
                  <div className="w-8 h-8 rounded bg-primary-500" />
                </div>
              </button>
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
            { key: 'email', label: 'Email Notifications', description: 'Receive email updates for important events' },
            { key: 'push', label: 'Push Notifications', description: 'Browser push notifications' },
            { key: 'inApp', label: 'In-App Notifications', description: 'Notifications within the application' },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0"
            >
              <div>
                <p className="font-medium text-neutral-900">{item.label}</p>
                <p className="text-sm text-neutral-600">{item.description}</p>
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

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <div className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
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
    </div>
  )
}
