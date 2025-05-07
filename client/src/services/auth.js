// app/services/auth.js

const TOKEN_KEY = 'token'

const auth = {
  login: () => {
    // จำลองการ login โดยใส่ token mock
    localStorage.setItem(TOKEN_KEY, 'mock-token')
  },

  logout: () => {
    // ล้าง token เมื่อ logout
    localStorage.removeItem(TOKEN_KEY)
    return 'Logout successful'
  },

  isAuthenticated: () => {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem(TOKEN_KEY)
  },

  getToken: () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  }
}

export default auth
