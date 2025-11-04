import { Link, useLocation } from 'react-router-dom'
import logoSrc from '../images/logo.png'

export default function Nav() {
  const { pathname } = useLocation()

  //base styles for nav links
  const base = {
    color: 'white',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: 500,
    padding: '16px 24px',
    transition: 'background 0.15s',
    display: 'inline-block'
  }

  const getStyle = (path, exact = false) => {
    const active = exact ? pathname === path : pathname.startsWith(path)
    return {
      ...base,
      background: active ? '#1a252f' : 'transparent',
      fontWeight: active ? 700 : 500
    }
  }

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between', 
      background: '#2c3e50',
      padding: '0 12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={getStyle('/', true)}>Upload</Link>
        <Link to="/spreadsheet" style={getStyle('/spreadsheet')}>Spreadsheet</Link>
        <Link to="/report" style={getStyle('/report')}>Report</Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" title="Home">
          <img src={logoSrc} alt="Logo" style={{ height: 60, width: 'auto', marginTop: 5}} />
        </Link>
      </div>
    </nav>
  )
}