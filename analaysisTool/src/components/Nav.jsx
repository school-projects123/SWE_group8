import { Link, useLocation } from 'react-router-dom'
import logoSrc from '../images/logo.png'
import { useState } from 'react'
import helpSrc from '../images/help_icon.png'

export default function Nav() {
  const { pathname } = useLocation()
  const [showHelp, setShowHelp] = useState(false)
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
    <div>
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
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight:16 }} 
          title="Help">
          <img src={helpSrc} alt="Help" style={{ height: 45, width: 'auto' }} />
        </button>
        <Link to="/" title="Start">
          <img src={logoSrc} alt="Logo" style={{ height: 60, width: 'auto', marginTop: 5}} />
        </Link>
      </div>
    </nav>

    {showHelp && (
        <div style={{
          background: '#f0f0f0',
          padding: '20px 24px',
          borderBottom: '1px solid #ddd',
          color: '#222',
          fontSize: '14px',
          lineHeight: '1.6'
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Help to Navigate The Site</h3>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li><strong>Upload Page:</strong> Select and upload your CSV or Excel files to analyze student data and click on the button to generate the master spreadsheet.</li>
              <li><strong>Spreadsheet Page:</strong> View the processed data in table format after uploading files from the previous page</li>
              <li><strong>Report Page:</strong> See detailed analysis and insights about the uploaded student data.</li>
            </ul>
            <button
              onClick={() => setShowHelp(false)}
              style={{
                marginTop: '12px',
                padding: '8px 16px',
                background: '#2c3e50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}