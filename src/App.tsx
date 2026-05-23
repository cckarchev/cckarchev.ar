import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './routes/Home'
import GreathelmCards from './routes/tools/GreathelmCards'
import WarmasterMap from './routes/tools/WarmasterMap'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tools/greathelm-cards" element={<GreathelmCards />} />
        <Route path="/tools/warmaster-map" element={<WarmasterMap />} />
      </Routes>
    </BrowserRouter>
  )
}
