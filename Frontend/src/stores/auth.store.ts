import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import axiosInstance from '@/config/axios.config'
import { useRouter } from 'vue-router'

//Interface
import type { AlertsCore, ModulePermission } from 'uikit-3it-vue'
import type { UserAuthCore, UserAuthConfig } from '@/interfaces'
//Factories
import { initialUserConfig, initialAlert } from '@/factories'

// Constants
import { APP_URL } from '@/constants'

export const useStoreAuth = defineStore('auth', () => {
  const router = useRouter()
  
  // State - Usuario mock para desarrollo sin autenticación
  const user = ref<UserAuthCore | null>({
    id: 1,
    firstName: 'Usuario',
    lastName: 'Demo',
    email: 'demo@3it.cl',
    phone: '56912345678',
    birthday: '1990-01-01',
    avatar: '/img/avatar.png',
    role: {
      id: 1,
      name: 'Administrador',
    }
  })
  const permissions = ref<ModulePermission[]>([
    {
      name: "Home",
      description: "Página de inicio",
      path: "/",
      subModules: []
    },
    {
      name: "Chatbots",
      description: "Gestión de chatbots",
      path: "/chatbots",
      subModules: []
    }
  ])
  
  // Menú por defecto mientras carga
  const defaultMenu = {
    main: [
      {
        id: 110,
        name: "Home",
        icon: "fa-solid fa-house",
        url: "/",
        requiresPermissions: false,
        module: "Home",
        submenu: []
      },
      {
        id: 120,
        name: "Chatbots",
        icon: "fa-solid fa-robot",
        url: "/chatbots/new",
        requiresPermissions: false,
        module: "Chatbots",
        submenu: []
      }
    ],
    admin: []
  }
  
  const config = ref<UserAuthConfig>(JSON.parse(localStorage.getItem('config') || 'null') || { ...initialUserConfig })
  const menu = ref(JSON.parse(localStorage.getItem('menu') || 'null') || defaultMenu)

  const sidebar = reactive({
    toggleMobile: false,
    toggleCollapse: false,
  })

  const loginSubmitting = ref(false)
  const loginError = ref(false)
  const messageAlert = ref<AlertsCore>({ ...initialAlert })
  const successMessage = ref<string | null>(null)
  const errorMessage = ref<string | null>(null)
  const errorBack = ref<unknown | null>(null)
  const loadingUser = ref(false)

  // Actions
  const getUserConfig = async () => {
    try {
      const response = await fetch(`/db/config/config.json`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      menu.value = data.menu
      localStorage.setItem('menu', JSON.stringify(data.menu))
      if(!localStorage.getItem('config')) {
        localStorage.setItem('config', JSON.stringify(data.config))
      }
    } catch (error) {
      console.error('Error cargando config:', error)
      // Usar menú por defecto si falla
      menu.value = defaultMenu
      localStorage.setItem('menu', JSON.stringify(defaultMenu))
      errorBack.value = error
    }
  }
/*   async function login(credentials: { email: string; password: string }) {
    try {
      loginSubmitting.value = true

      const simulateFetch = () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            if (
              credentials.email === 'adminTest@3it.cl' &&
              credentials.password === 'admin2025'
            ) {
              resolve({
                success: true,
                json: () =>
                  Promise.resolve({
                    id: 1,
                    firstName: 'Admin',
                    lastName: '3IT',
                    email: 'admin@3it.cl',
                    phone: '56976609486',
                    birthday: '1990-01-01',
                    avatar: '/img/avatar.png',
                    role: {
                      id: 1,
                      name: 'Administrador',
                    },
                    jwt: 'token_simulado',
                    modules: [
                      {
                        name: "Usuarios",
                        description: "Información de usuarios registrados",
                        path: "/user",
                        subModules: [
                          {
                            name: "Users",
                            description: "Información de usuarios registrados",
                            path: "/users",
                            canRead: true,
                            canCreate: true,
                            canUpdate: true,
                            canDelete: true
                          },
                          {
                            name: "Roles",
                            description: "Información de roles registrados",
                            path: "/users/roles",
                            canRead: true,
                            canCreate: true,
                            canUpdate: true,
                            canDelete: true
                          }
                        ],
                      }
                    ]
                  })
              })
            } else {
              resolve({
                success: false,
                json: () =>
                  Promise.resolve({
                    token: '',
                    message: 'Usuario o contraseña incorrectos',
                    data: {}
                  })
              })
            }
          }, 500)
        })
      }
      interface SimulateFetchResponse {
        success: boolean;
        json: () => Promise<{
          id: number;
          firstName: string;
          lastName: string;
          email: string;
          phone: string;
          birthday: string;
          avatar: string;
          role: {
            id: number;
            name: string;
          };
          jwt: string;
          modules: Array<{
            name: string,
            description: string,
            path: string,
            subModules: Array<{
              name: string,
              description: string,
              path: string,
              canRead: boolean,
              canCreate: boolean,
              canUpdate: boolean,
              canDelete: boolean,
            }>;
          }>;
        }>;
      }

      const response = (await simulateFetch()) as SimulateFetchResponse

      const data = await response.json()
      loginSubmitting.value = false

      if (response.success) {
        statusError.value = false
        await getConfig()
        user.value = data
        permissions.value = data.modules
        localStorage.setItem('user', JSON.stringify(data))
        localStorage.setItem('permissions', JSON.stringify(permissions.value))
        localStorage.setItem('authToken', data.jwt)
        router.push('/')
      } else {
        statusError.value = true
      }
    } catch (error) {
      console.error(error)
    }
  } */

  const login = async (credentials: { email: string; password: string }) => {
    try {
      loginSubmitting.value = true
      const data_ = {
        identifier: credentials.email,
        password: credentials.password,
      }
      const response = await fetch(`${APP_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data_),
      })
      const data = await response.json()
      loginSubmitting.value = false
      if ([401, 500, 503].includes(response.status)) {
        loginError.value = true
      } else {
        loginError.value = false
        await getUserConfig()
        user.value = data.user
        permissions.value = data.modules
        localStorage.setItem('authToken', data.jwt)
        router.push('/')
      }
    } catch (error) {
      errorBack.value = error
    }
  }

  async function getCurrentUser() {
    loadingUser.value = true

    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        user.value = null
        loadingUser.value = false
        return
      }

      const { data } = await axiosInstance('/auth/me')
      user.value = data.user
      permissions.value = data.modules
      await getUserConfig()
    } catch (error) {
      console.warn('Error getting current user:', error)
      user.value = null
      errorBack.value = error
    } finally {
      loadingUser.value = false
    }
  }

  const reset = () => {
    user.value = null
    permissions.value = []
    menu.value = null
  }

  const logout = () => {
    reset()
    localStorage.removeItem('user')
    localStorage.removeItem('permissions')
    localStorage.removeItem('menu')
    localStorage.removeItem('authToken')
    router.push('/login')
  }

  const handleSidebarCollapse = () => {
    sidebar.toggleCollapse = !sidebar.toggleCollapse
  }

  const handleSidebarMobile = () => {
    sidebar.toggleMobile = !sidebar.toggleMobile
  }

  const darkThemeToggle = () => {
    if (config.value) {
      config.value.darkTheme = !config.value.darkTheme
      localStorage.setItem('config', JSON.stringify(config.value))
    }
  }

  const changeTheme = () => {
    if (!config.value?.darkTheme) {
      document.documentElement.setAttribute('data-eit-theme', 'light')
    } else {
      document.documentElement.setAttribute('data-eit-theme', 'dark')
    }
  }

/*   const changeTheme = () => {
    const { platformDarkTheme } = useStoreTheme()
    if (platformDarkTheme) {
      document.documentElement.setAttribute('data-eit-theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-eit-theme', 'light')
    }
    if (user.value !== null) {
      if (!config.value?.darkTheme) {
        document.documentElement.setAttribute('data-eit-theme', 'light')
      } else {
        document.documentElement.setAttribute('data-eit-theme', 'dark')
      }
    }
  } */

  return {
    user,
    permissions,
    config,
    menu,
    sidebar,
    loginSubmitting,
    loginError,
    messageAlert,
    successMessage,
    errorMessage,
    errorBack,
    loadingUser,
    getUserConfig,
    login,
    getCurrentUser,
    reset,
    logout,
    handleSidebarCollapse,
    handleSidebarMobile,
    darkThemeToggle,
    changeTheme,
  }
})