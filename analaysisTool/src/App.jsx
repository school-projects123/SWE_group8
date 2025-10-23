import { Routes, Route } from 'react-router-dom'
import Upload from './pages/Upload'
import Spreadsheet from './pages/Spreadsheet'
import Report from './pages/Report'
import Layout from './components/Layout'
import './index.css'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Upload />} />
        <Route path="spreadsheet" element={<Spreadsheet />} />
        <Route path="report" element={<Report />} />
      </Route>
    </Routes>
  )
}
