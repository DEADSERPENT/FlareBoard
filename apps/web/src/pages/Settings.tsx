import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { User, Bell, Shield, Palette, Database, Key } from 'lucide-react'

export const SettingsPage = () => {
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
            <Input label="Full Name" defaultValue="Samartha" />
            <Input label="Email" type="email" defaultValue="admin@flareboard.com" />
          </div>
          <Input label="Role" defaultValue="Administrator" disabled />
          <div className="flex justify-end gap-3">
            <Button variant="ghost">Cancel</Button>
            <Button variant="primary">Save Changes</Button>
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
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Color Theme
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button className="p-4 border-2 border-primary-500 rounded-lg bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-900">Light Orange</span>
                  <Badge variant="orange">Active</Badge>
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded bg-white border-2 border-neutral-200" />
                  <div className="w-8 h-8 rounded bg-primary-500" />
                </div>
              </button>

              <button className="p-4 border-2 border-neutral-200 rounded-lg bg-white hover:border-neutral-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-900">Dark</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded bg-neutral-900" />
                  <div className="w-8 h-8 rounded bg-primary-500" />
                </div>
              </button>

              <button className="p-4 border-2 border-neutral-200 rounded-lg bg-white hover:border-neutral-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-900">Auto</span>
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
            { label: 'Email Notifications', description: 'Receive email updates for important events' },
            { label: 'Push Notifications', description: 'Browser push notifications' },
            { label: 'Task Updates', description: 'Notify when tasks are assigned or updated' },
            { label: 'Project Updates', description: 'Notify when projects change status' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
              <div>
                <p className="font-medium text-neutral-900">{item.label}</p>
                <p className="text-sm text-neutral-600">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
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
            <Button variant="outline" className="w-full justify-start">
              <Key className="w-5 h-5" />
              Change Password
            </Button>
          </div>
          <div>
            <Button variant="outline" className="w-full justify-start">
              <Database className="w-5 h-5" />
              Download Your Data
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
