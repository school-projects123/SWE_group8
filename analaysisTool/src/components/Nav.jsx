import { Link, useLocation } from 'react-router-dom'
import logoSrc from '../images/logo.png'
import { useEffect } from 'react'
import helpSrc from '../images/help_icon.png'

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
+        <Link to="/app" style={getStyle('/app', true)}>Upload</Link>
+        <Link to="/app/spreadsheet" style={getStyle('/app/spreadsheet')}>Spreadsheet</Link>
+        <Link to="/app/report" style={getStyle('/app/report')}>Report</Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button onClick={() => setShowHelp(!showHelp)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight:16 }} title='Help'>
          <img src={helpSrc} alt="Help" style={{ height: 45, width: 'auto' }} />
        </button>
        <Link to="/" title="Start">
          <img src={logoSrc} alt="Logo" style={{ height: 60, width: 'auto', marginTop: 5}} />
        </Link>
      </div>
    </nav>

    
  )
}