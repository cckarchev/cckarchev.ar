import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './routes/Home'
import GreathelmCards from './routes/tools/GreathelmCards'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tools/greathelm-cards" element={<GreathelmCards />} />
      </Routes>
    </BrowserRouter>
  )
}
