import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Profile from './pages/Profile'
import Admin from './pages/Admin'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App