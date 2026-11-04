import { createContext, useCallback, useContext, useMemo, useRef } from 'react'
import { demoUsers, publicUser } from '../data/users'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { STORAGE_KEYS } from '../utils/constants'

// Demo-only authentication. Credentials live in localStorage and every check
// happens in the browser — this is NOT secure and must be replaced by a real
// backend before production use.

const AuthContext = createContext(null)

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const matches = (user, identifier) => {
  const id = identifier.trim().toLowerCase()
  return user.email.toLowerCase() === id || user.employeeId.toLowerCase() === id
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useLocalStorage(STORAGE_KEYS.users, demoUsers)
  const [session, setSession] = useLocalStorage(STORAGE_KEYS.auth, null)
  const resetTokens = useRef(new Map())

  const user = useMemo(() => {
    const found = session && users.find((u) => u.id === session.userId)
    return found ? publicUser(found) : null
  }, [session, users])

  const login = useCallback(
    async (identifier, password, remember = true) => {
      await wait(450)
      const found = users.find((u) => matches(u, identifier))
      if (!found) return { ok: false, error: "We couldn't find that Employee ID or email. Try a demo account below." }
      if (found.password !== password) return { ok: false, error: 'Incorrect password for this demo account.' }
      setSession({ userId: found.id, remember, at: new Date().toISOString() })
      return { ok: true, user: publicUser(found) }
    },
    [users, setSession],
  )

  const logout = useCallback(() => setSession(null), [setSession])

  // Prototype helper (APK: "Demo guide & switch role").
  const switchRole = useCallback(
    (role) => {
      const target = users.find((u) => u.role === role)
      if (!target) return null
      setSession({ userId: target.id, remember: true, at: new Date().toISOString() })
      return publicUser(target)
    },
    [users, setSession],
  )

  const loginAs = useCallback(
    (userId) => {
      setSession({ userId, remember: true, at: new Date().toISOString() })
    },
    [setSession],
  )

  const requestPasswordReset = useCallback(
    async (identifier) => {
      await wait(500)
      const found = users.find((u) => matches(u, identifier))
      if (!found) return { ok: false, error: 'No demo account matches that Employee ID or email.' }
      const token = Math.random().toString(36).slice(2, 10)
      resetTokens.current.set(token, found.id)
      return { ok: true, token, email: found.email }
    },
    [users],
  )

  const resetPassword = useCallback(
    async (token, newPassword) => {
      await wait(450)
      const userId = resetTokens.current.get(token)
      if (!userId) return { ok: false, error: 'This reset link is invalid or has expired. Request a new one.' }
      resetTokens.current.delete(token)
      setUsers((list) => list.map((u) => (u.id === userId ? { ...u, password: newPassword } : u)))
      return { ok: true }
    },
    [setUsers],
  )

  const changePassword = useCallback(
    async (current, next) => {
      await wait(400)
      const found = users.find((u) => u.id === session?.userId)
      if (!found || found.password !== current) return { ok: false, error: 'Current password is incorrect.' }
      setUsers((list) => list.map((u) => (u.id === found.id ? { ...u, password: next } : u)))
      return { ok: true }
    },
    [users, session, setUsers],
  )

  const updateProfile = useCallback(
    (patch) => {
      setUsers((list) => list.map((u) => (u.id === session?.userId ? { ...u, ...patch } : u)))
    },
    [session, setUsers],
  )

  const resetAccounts = useCallback(() => setUsers(demoUsers), [setUsers])

  const value = useMemo(
    () => ({
      user,
      users: users.map(publicUser),
      isAuthenticated: Boolean(user),
      login,
      logout,
      switchRole,
      loginAs,
      requestPasswordReset,
      resetPassword,
      changePassword,
      updateProfile,
      resetAccounts,
    }),
    [user, users, login, logout, switchRole, loginAs, requestPasswordReset, resetPassword, changePassword, updateProfile, resetAccounts],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
