export default function Nav() {
  return (
    <nav style={{
      background: '#2c3e50',
      padding: '0',
      display: 'flex',
      gap: '0',
      alignItems: 'stretch'
    }}>
      <a href="/" style={{
        color: 'white',
        textDecoration: 'none',
        fontSize: '16px',
        fontWeight: '500',
        padding: '16px 32px',
        borderRadius: '0',
        transition: 'background 0.2s',
        background: 'transparent'
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#34495e'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      onMouseDown={e => e.currentTarget.style.background = '#1a252f'}
      onMouseUp={e => e.currentTarget.style.background = '#34495e'}>
        Upload
      </a>
      <a href="/spreadsheet" style={{
        color: 'white',
        textDecoration: 'none',
        fontSize: '16px',
        fontWeight: '500',
        padding: '16px 32px',
        borderRadius: '0',
        transition: 'background 0.2s',
        background: 'transparent'
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#34495e'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      onMouseDown={e => e.currentTarget.style.background = '#1a252f'}
      onMouseUp={e => e.currentTarget.style.background = '#34495e'}>
        Spreadsheet
      </a>
      <a href="/report" style={{
        color: 'white',
        textDecoration: 'none',
        fontSize: '16px',
        fontWeight: '500',
        padding: '16px 32px',
        borderRadius: '0',
        transition: 'background 0.2s',
        background: 'transparent'
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#34495e'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      onMouseDown={e => e.currentTarget.style.background = '#1a252f'}
      onMouseUp={e => e.currentTarget.style.background = '#34495e'}>
        Report
      </a>
    </nav>
  )
}