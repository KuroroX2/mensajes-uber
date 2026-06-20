import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Home from './pages/Home'
import TemplatesList from './pages/TemplatesList'
import TemplateEditor from './pages/TemplateEditor'

function App() {
  return (
    <div className="app-shell">
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/plantillas"
            element={
              <ProtectedRoute>
                <TemplatesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/plantillas/nueva"
            element={
              <ProtectedRoute>
                <TemplateEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/plantillas/:id"
            element={
              <ProtectedRoute>
                <TemplateEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </div>
  )
}

export default App
