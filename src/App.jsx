import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './components/common/CommonToast'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { ThemeProvider } from './context/ThemeContext'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  return (
    // startTransition keeps the current page on screen while the next lazy page loads.
    <BrowserRouter future={{ v7_startTransition: true }}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <DataProvider>
              <AppRoutes />
            </DataProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
