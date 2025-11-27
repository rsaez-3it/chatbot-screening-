import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useStoreAuth } from '@/stores'
import { handleAuthentication } from '@/middlewares/auth.middleware'

//Views
import LoginView from '@/views/public/LoginView.vue'
import LogoutView from '@/views/public/LogoutView.vue'
import HomeView from '@/views/HomeView.vue'
import UsersView from '@/views/users/UsersView.vue'
import UsersListView from '@/views/users/children/UsersListView.vue'
import UsersFormView from '@/views/users/children/UsersFormView.vue'
import RolesView from '@/views/roles/RolesView.vue'
import RolesListView from '@/views/roles/children/RolesListView.vue'
import RolesFormView from '@/views/roles/children/RolesFormView.vue'
import ChatbotFormView from '@/views/chatbot/ChatbotFormView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { 
      title: 'Login',
      layout: 'LayoutPublicDefault', 
      requiresAuth: false,
      permissionType: 'canRead',
      requiresPermissions: false,
      module: 'Login',
      parent: ''
    }
  },
  {
    path: '/logout',
    name: 'Logout',
    meta: { 
      title: 'Logout', 
      layout: 'LayoutPublicDefault',
      requiresAuth: true,
      permissionType: 'canRead',
      requiresPermissions: false,
      module: 'Logout',
      parent: ''
    },
    component: LogoutView
  },
  {
    path: '/',
    name: 'Inicio',
    component: HomeView,
    meta: {
      title: 'Inicio',
      layout: 'LayoutPrivateDefault',
      requiresAuth: false,
      permissionType: 'canRead',
      requiresPermissions: false,
      module: 'Home',
      parent: ''
    },
  },
  {
    path: '/users',
    name: 'Usuarios',
    component: UsersView,
    meta: { 
      title: 'Usuarios',
      layout: 'LayoutPrivateDefault', 
      requiresAuth: true,
      permissionType: 'canRead',
      requiresPermissions: true,
      module: 'Users',
      parent: ''
    },
    children: [
      {
        path: '',
        name: 'Lista de usuarios',
        component: UsersListView,
        meta: { 
          title: 'Lista de usuarios',
          layout: 'LayoutPrivateDefault', 
          requiresAuth: true,
          permissionType: 'canRead',
          requiresPermissions: true,
          module: 'Users',
          parent: ''
        }
      },
      {
        path: 'new',
        name: 'Nuevo usuario',
        component: UsersFormView,
        meta: { 
          title: 'Nuevo usuario',
          layout: 'LayoutPrivateDefault', 
          requiresAuth: true,
          permissionType: 'canCreate',
          requiresPermissions: true,
          module: 'Users',
          parent: ''
        }
      },
      {
        path: 'edit=:id',
        name: 'Editar usuario',
        component: UsersFormView,
        meta: { 
          title: 'Editar usuario',
          layout: 'LayoutPrivateDefault', 
          requiresAuth: true,
          permissionType: 'canUpdate',
          requiresPermissions: true,
          module: 'Users',
          parent: ''
        }
      },
    ],
  },
  {
    path: '/users/roles',
    name: 'Roles',
    component: RolesView,
    meta: { 
      title: 'Roles',
      layout: 'LayoutPrivateDefault', 
      requiresAuth: true,
      permissionType: 'canRead',
      requiresPermissions: true,
      module: 'Roles',
      parent: ''
    },
    children: [
      {
        path: '',
        name: 'Lista de roles',
        component: RolesListView,
        meta: { 
          title: 'Lista de roles',
          layout: 'LayoutPrivateDefault', 
          requiresAuth: true,
          permissionType: 'canRead',
          requiresPermissions: true,
          module: 'Roles',
          parent: ''
        }
      },
      {
        path: 'new',
        name: 'Nuevo rol',
        component: RolesFormView,
        meta: { 
          title: 'Nuevo rol',
          layout: 'LayoutPrivateDefault', 
          requiresAuth: true,
          permissionType: 'canCreate',
          requiresPermissions: true,
          module: 'Roles',
          parent: ''
        }
      },
      {
        path: 'edit=:id',
        name: 'Editar rol',
        component: RolesFormView,
        meta: { 
          title: 'Editar rol',
          layout: 'LayoutPrivateDefault', 
          requiresAuth: true,
          permissionType: 'canUpdate',
          requiresPermissions: true,
          module: 'Roles',
          parent: ''
        }
      },
    ],
  },
  {
    path: '/chatbots',
    name: 'Chatbots',
    redirect: '/chatbots/new',
    meta: {
      title: 'Chatbots',
      layout: 'LayoutPrivateDefault',
      requiresAuth: false,
      permissionType: 'canRead',
      requiresPermissions: false,
      module: 'Chatbots',
      parent: ''
    },
    children: [
      {
        path: 'new',
        name: 'Nuevo chatbot',
        component: ChatbotFormView,
        meta: {
          title: 'Nuevo chatbot',
          layout: 'LayoutPrivateDefault',
          requiresAuth: false,
          permissionType: 'canCreate',
          requiresPermissions: false,
          module: 'Chatbots',
          parent: ''
        }
      },
      {
        path: 'edit=:id',
        name: 'Editar chatbot',
        component: ChatbotFormView,
        meta: {
          title: 'Editar chatbot',
          layout: 'LayoutPrivateDefault',
          requiresAuth: false,
          permissionType: 'canUpdate',
          requiresPermissions: false,
          module: 'Chatbots',
          parent: ''
        }
      },
    ],
  },
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: HomeView,
    meta: { 
      title: 'unauthorized',
      layout: 'LayoutPrivateDefault', 
      requiresAuth: true,
      permissionType: 'canRead',
      requiresPermissions: false,
      module: 'Unauthorized',
      parent: ''
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: HomeView,
    meta: { 
      title: 'notFound',
      layout: 'LayoutPrivateDefault', 
      requiresAuth: true,
      permissionType: 'canRead',
      requiresPermissions: false,
      module: 'NotFound',
      parent: ''
    }
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  linkActiveClass: 'active',
  routes
})

// TEMPORARILY DISABLED - Authentication middleware blocks navigation
// TODO: Enable authentication middleware when integrated with external auth system
// router.beforeEach(async (to, from) => {
//   const storeAuth = useStoreAuth()
//   return await handleAuthentication(to, from, storeAuth)
// })

export default router
