import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Chat from './pages/Chat'

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
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App