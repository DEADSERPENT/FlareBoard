import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding FlareBoard database...')

  // ── Roles (Admin + Member only) ──────────────────────────────────────────
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      permissions: {
        canManageUsers: true,
        canManageProjects: true,
        canManageSettings: true,
        canViewAnalytics: true,
      },
    },
  })

  const memberRole = await prisma.role.upsert({
    where: { name: 'Member' },
    update: {},
    create: {
      name: 'Member',
      permissions: {
        canManageUsers: false,
        canManageProjects: true,
        canManageSettings: false,
        canViewAnalytics: true,
      },
    },
  })

  console.log('Roles created: Admin, Member')

  // ── Admin user (credentials from .env, with safe fallbacks for dev) ──────
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@flareboard.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'password123'
  const adminHash = await bcrypt.hash(adminPassword, 10)

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: adminHash,
      fullName: 'Samartha',
      roleId: adminRole.id,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    },
  })

  // ── Demo member users ─────────────────────────────────────────────────────
  const memberHash = await bcrypt.hash('password123', 10)

  const member1 = await prisma.user.upsert({
    where: { email: 'alice@flareboard.com' },
    update: {},
    create: {
      email: 'alice@flareboard.com',
      password: memberHash,
      fullName: 'Alice Johnson',
      roleId: memberRole.id,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    },
  })

  const member2 = await prisma.user.upsert({
    where: { email: 'bob@flareboard.com' },
    update: {},
    create: {
      email: 'bob@flareboard.com',
      password: memberHash,
      fullName: 'Bob Smith',
      roleId: memberRole.id,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    },
  })

  console.log('Users created')

  // ── Projects ──────────────────────────────────────────────────────────────
  const project1 = await prisma.project.create({
    data: {
      name: 'FlareBoard Dashboard v2.0',
      description: 'Next generation dashboard with real-time analytics',
      ownerId: adminUser.id,
      status: 'Active',
    },
  })

  const project2 = await prisma.project.create({
    data: {
      name: 'FlareBoard Mobile App',
      description: 'Mobile companion app for the FlareBoard platform',
      ownerId: member1.id,
      status: 'Active',
    },
  })

  const project3 = await prisma.project.create({
    data: {
      name: 'API Modernization',
      description: 'Refactor legacy APIs to GraphQL',
      ownerId: adminUser.id,
      status: 'Planning',
    },
  })

  console.log('Projects created')

  // ── Tasks ─────────────────────────────────────────────────────────────────
  await prisma.task.createMany({
    data: [
      { projectId: project1.id, title: 'Design new widget system', description: 'Create mockups for the new widget architecture', status: 'Done', priority: 'High', assignedTo: member1.id, position: 0 },
      { projectId: project1.id, title: 'Implement drag-and-drop', description: 'Add drag-and-drop functionality to dashboards', status: 'In Progress', priority: 'High', assignedTo: member1.id, position: 1 },
      { projectId: project1.id, title: 'Write unit tests', description: 'Add test coverage for widget components', status: 'Todo', priority: 'Medium', assignedTo: member2.id, position: 2 },
      { projectId: project2.id, title: 'Setup React Native project', description: 'Initialize project with Expo', status: 'Done', priority: 'High', assignedTo: adminUser.id, position: 0 },
      { projectId: project2.id, title: 'Design app screens', description: 'Create Figma designs for all main screens', status: 'In Progress', priority: 'High', assignedTo: member1.id, position: 1 },
      { projectId: project2.id, title: 'Implement authentication', description: 'Add login and signup flows', status: 'Todo', priority: 'High', position: 2 },
      { projectId: project3.id, title: 'Audit existing APIs', description: 'Document all REST endpoints', status: 'Todo', priority: 'Medium', assignedTo: member2.id, position: 0 },
      { projectId: project3.id, title: 'Setup GraphQL server', description: 'Initialize Apollo Server', status: 'Todo', priority: 'High', position: 1 },
    ],
  })

  console.log('Tasks created')

  // ── Dashboard + Widgets ───────────────────────────────────────────────────
  const defaultDashboard = await prisma.dashboard.create({
    data: {
      userId: adminUser.id,
      name: 'My Dashboard',
      isDefault: true,
      layoutConfig: {
        widget1: { x: 0, y: 0, w: 6, h: 4 },
        widget2: { x: 6, y: 0, w: 6, h: 4 },
        widget3: { x: 0, y: 4, w: 12, h: 6 },
      },
    },
  })

  await prisma.widget.createMany({
    data: [
      { dashboardId: defaultDashboard.id, type: 'KPI', title: 'Active Projects', settings: { value: 12, trend: 8, format: 'number' } },
      { dashboardId: defaultDashboard.id, type: 'LineChart', title: 'Task Completion Rate', settings: { dataSource: 'tasks', xAxis: 'date', yAxis: 'completionRate' } },
      { dashboardId: defaultDashboard.id, type: 'Feed', title: 'Recent Activity', settings: { source: 'activity', limit: 10 } },
    ],
  })

  console.log('Dashboard + Widgets created')

  // ── Activity Logs ─────────────────────────────────────────────────────────
  await prisma.activityLog.createMany({
    data: [
      { userId: adminUser.id, action: 'project.created', entityType: 'project', entityId: project1.id, metadata: { projectName: project1.name } },
      { userId: member1.id, action: 'task.completed', entityType: 'task', entityId: 'task-1', metadata: { taskTitle: 'Design new widget system' } },
      { userId: adminUser.id, action: 'user.invited', entityType: 'user', entityId: member2.id, metadata: { email: member2.email } },
    ],
  })

  // ── Notifications ─────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { userId: adminUser.id, type: 'task', title: 'New Task Assigned', message: 'You have been assigned to "Implement drag-and-drop"', icon: '', actionUrl: '/kanban', actionText: 'View Task', priority: 'high', category: 'task', isRead: false },
      { userId: adminUser.id, type: 'mention', title: 'You were mentioned', message: 'Alice Johnson mentioned you in a comment', icon: '', actionUrl: '/kanban', actionText: 'View Comment', priority: 'normal', category: 'mention', isRead: false },
      { userId: member1.id, type: 'success', title: 'Project Milestone', message: 'Project milestone reached: FlareBoard Dashboard v2.0', icon: '', actionUrl: '/projects', actionText: 'View Details', priority: 'high', category: 'project', isRead: false },
      { userId: member2.id, type: 'info', title: 'Welcome to FlareBoard!', message: 'You have been added to the team! Get started by exploring your dashboard.', icon: '', actionUrl: '/dashboard', actionText: 'Get Started', priority: 'normal', category: 'general', isRead: true },
    ],
  })

  // ── User Preferences ──────────────────────────────────────────────────────
  await prisma.userPreferences.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      theme: 'dark',
      defaultDashboard: defaultDashboard.id,
      notifications: { email: true, push: true, inApp: true },
      timezone: 'America/New_York',
    },
  })

  console.log('\nSeeding completed!')
  console.log('\nDatabase Summary:')
  console.log('  Roles: Admin, Member')
  console.log(`  Admin: ${adminEmail} / ${adminPassword}`)
  console.log('  Members: alice@flareboard.com / password123')
  console.log('           bob@flareboard.com / password123')
}

main()
  .catch(e => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
