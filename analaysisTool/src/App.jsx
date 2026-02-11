import { Routes, Route } from 'react-router-dom'
import Start from './pages/Start'
import Upload from './pages/Upload'
import Spreadsheet from './pages/Spreadsheet'
import Report from './pages/Report'
import Login from './pages/Login'
import Layout from './components/Layout'
import './index.css'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Start />} />
      {/* put app pages under /app so Start remains at / */}
      <Route path="/app" element={<Layout />}>
        <Route index element={<Upload />} />
        <Route path="spreadsheet" element={<Spreadsheet />} />
        <Route path="report" element={<Report />} />
      </Route>
      <Route path="/login" element={<Login />} /> 
    </Routes>
  )
}
