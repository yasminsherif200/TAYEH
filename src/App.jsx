import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Chat from './pages/Chat'
import AdminLayout from './pages/admin/AdminLayout'
import Analytics from './pages/admin/Analytics'
import Places from './pages/admin/Places'

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
          <Route path="/admin/places" element={<Places />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App