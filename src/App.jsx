import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Loader from './components/Loader'
import Cursor from './components/Cursor'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Contact from './pages/Contact'
import Projects from './pages/Projects'
import { useLenis } from './hooks/useLenis'
import './App.css'

function AppInner() {
  useLenis()
  return null
}

export default function App() {
  const [entered, setEntered] = useState(false)

  return (
    <BrowserRouter>
      <Cursor />
      {!entered && <Loader onEnter={() => setEntered(true)} />}
      <Navbar show={entered} />
      <Routes>
        <Route path="/" element={<Home entered={entered} />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/projects" element={<Projects />} />
      </Routes>
      {entered && <AppInner />}
    </BrowserRouter>
  )
}
