import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, RequireAuth } from './auth'
import { ToastProvider } from './toast'
import { Shell } from './components/Shell'
import { Login } from './pages/Login'
import { Onboard } from './pages/Onboard'
import { Owners } from './pages/Owners'
import { Overview } from './pages/Overview'
import { Posts } from './pages/Posts'
import { Stores } from './pages/Stores'
import { Users } from './pages/Users'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<RequireAuth />}>
              <Route element={<Shell />}>
                <Route index element={<Overview />} />
                <Route path="stores" element={<Stores />} />
                <Route path="stores/new" element={<Onboard />} />
                <Route path="owners" element={<Owners />} />
                <Route path="content" element={<Posts />} />
                <Route path="posts" element={<Navigate to="/content" replace />} />
                <Route path="users" element={<Users />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
