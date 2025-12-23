import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔥 Seeding FlareBoard database...')

  // Create Roles
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

  const managerRole = await prisma.role.upsert({
    where: { name: 'Manager' },
    update: {},
    create: {
      name: 'Manager',
      permissions: {
        canManageUsers: false,
        canManageProjects: true,
        canManageSettings: false,
        canViewAnalytics: true,
      },
    },
  })

  const viewerRole = await prisma.role.upsert({
    where: { name: 'Viewer' },
    update: {},
    create: {
      name: 'Viewer',
      permissions: {
        canManageUsers: false,
        canManageProjects: false,
        canManageSettings: false,
        canViewAnalytics: false,
      },
    },
  })

  console.log('✅ Roles created')

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10)

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@flareboard.com' },
    update: {},
    create: {
      email: 'admin@flareboard.com',
      password: hashedPassword,
      fullName: 'Samartha',
      roleId: adminRole.id,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    },
  })

  const manager1 = await prisma.user.upsert({
    where: { email: 'alice@flareboard.com' },
    update: {},
    create: {
      email: 'alice@flareboard.com',
      password: hashedPassword,
      fullName: 'Alice Johnson',
      roleId: managerRole.id,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    },
  })

  const viewer1 = await prisma.user.upsert({
    where: { email: 'bob@flareboard.com' },
    update: {},
    create: {
      email: 'bob@flareboard.com',
      password: hashedPassword,
      fullName: 'Bob Smith',
      roleId: viewerRole.id,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    },
  })

  console.log('✅ Users created')

  // Create Projects
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
      ownerId: manager1.id,
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

  console.log('✅ Projects created')

  // Create Tasks
  await prisma.task.createMany({
    data: [
      // Project 1 tasks
      {
        projectId: project1.id,
        title: 'Design new widget system',
        description: 'Create mockups for the new widget architecture',
        status: 'Done',
        priority: 'High',
        assignedTo: manager1.id,
        position: 0,
      },
      {
        projectId: project1.id,
        title: 'Implement drag-and-drop',
        description: 'Add drag-and-drop functionality to dashboards',
        status: 'InProgress',
        priority: 'High',
        assignedTo: manager1.id,
        position: 1,
      },
      {
        projectId: project1.id,
        title: 'Write unit tests',
        description: 'Add test coverage for widget components',
        status: 'Todo',
        priority: 'Medium',
        assignedTo: viewer1.id,
        position: 2,
      },
      // Project 2 tasks
      {
        projectId: project2.id,
        title: 'Setup React Native project',
        description: 'Initialize project with Expo',
        status: 'Done',
        priority: 'High',
        assignedTo: adminUser.id,
        position: 0,
      },
      {
        projectId: project2.id,
        title: 'Design app screens',
        description: 'Create Figma designs for all main screens',
        status: 'InProgress',
        priority: 'High',
        assignedTo: manager1.id,
        position: 1,
      },
      {
        projectId: project2.id,
        title: 'Implement authentication',
        description: 'Add login and signup flows',
        status: 'Todo',
        priority: 'High',
        position: 2,
      },
      // Project 3 tasks
      {
        projectId: project3.id,
        title: 'Audit existing APIs',
        description: 'Document all REST endpoints',
        status: 'Todo',
        priority: 'Medium',
        assignedTo: viewer1.id,
        position: 0,
      },
      {
        projectId: project3.id,
        title: 'Setup GraphQL server',
        description: 'Initialize Apollo Server',
        status: 'Todo',
        priority: 'High',
        position: 1,
      },
    ],
  })

  console.log('✅ Tasks created')

  // Create Dashboards
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

  console.log('✅ Dashboards created')

  // Create Widgets
  await prisma.widget.createMany({
    data: [
      {
        dashboardId: defaultDashboard.id,
        type: 'KPI',
        title: 'Active Projects',
        settings: {
          value: 12,
          trend: 8,
          format: 'number',
        },
      },
      {
        dashboardId: defaultDashboard.id,
        type: 'LineChart',
        title: 'Task Completion Rate',
        settings: {
          dataSource: 'tasks',
          xAxis: 'date',
          yAxis: 'completionRate',
        },
      },
      {
        dashboardId: defaultDashboard.id,
        type: 'Feed',
        title: 'Recent Activity',
        settings: {
          source: 'activity',
          limit: 10,
        },
      },
    ],
  })

  console.log('✅ Widgets created')

  // Create Activity Logs
  await prisma.activityLog.createMany({
    data: [
      {
        userId: adminUser.id,
        action: 'project.created',
        entityType: 'project',
        entityId: project1.id,
        metadata: { projectName: project1.name },
      },
      {
        userId: manager1.id,
        action: 'task.completed',
        entityType: 'task',
        entityId: 'task-1',
        metadata: { taskTitle: 'Design new widget system' },
      },
      {
        userId: adminUser.id,
        action: 'user.invited',
        entityType: 'user',
        entityId: viewer1.id,
        metadata: { email: viewer1.email },
      },
    ],
  })

  console.log('✅ Activity logs created')

  // Create Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: adminUser.id,
        content: 'New task assigned: Implement drag-and-drop',
        isRead: false,
      },
      {
        userId: manager1.id,
        content: 'Project milestone reached: Nebula Dashboard v2.0',
        isRead: false,
      },
      {
        userId: viewer1.id,
        content: 'You have been added to the team!',
        isRead: true,
      },
    ],
  })

  console.log('✅ Notifications created')

  // Create User Preferences
  await prisma.userPreferences.create({
    data: {
      userId: adminUser.id,
      theme: 'dark',
      defaultDashboard: defaultDashboard.id,
      notifications: {
        email: true,
        push: true,
        inApp: true,
      },
      timezone: 'America/New_York',
    },
  })

  console.log('✅ User preferences created')

  console.log('\n🎉 Seeding completed successfully!')
  console.log('\n📊 Database Summary:')
  console.log(`   - Roles: 3`)
  console.log(`   - Users: 3 (admin@flareboard.com / password123)`)
  console.log(`   - Projects: 3`)
  console.log(`   - Tasks: 8`)
  console.log(`   - Dashboards: 1`)
  console.log(`   - Widgets: 3`)
  console.log(`   - Activity Logs: 3`)
  console.log(`   - Notifications: 3`)
  console.log('\n🔑 Login with: admin@flareboard.com / password123')
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
