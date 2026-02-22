import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Home from './pages/Home'
import Editor from './pages/Editor'
import RecentDesigns from './pages/RecentDesigns'
import Profile from './pages/Profile'
import Help from './pages/Help'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Home />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/designs" element={<RecentDesigns />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/help" element={<Help />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App