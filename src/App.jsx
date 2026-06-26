import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Chat from './pages/Chat'
import AdminLayout from './pages/admin/AdminLayout'
import Analytics from './pages/admin/Analytics'

function App() {
  return (
    <BrowserRouter>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        minHeight: '100vh',
      }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/admin" element={<Analytics />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App