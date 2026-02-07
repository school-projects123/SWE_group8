import { useNavigate } from 'react-router-dom'

export default function Login() {
    const navigate = useNavigate()
    return (
    <main
      aria-label="Start page"
      style={{
        height: '100svh',
        display: 'flex',
        background: '#18375d',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box'
      }}
    >
     <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: 'white' }}>Login Page</h1>
        <h3 style={{ color: 'white' }}>This is a placeholder for the login page. Implement authentication here.</h3>
        <button 
          onClick={() => navigate('/app')}
          style={{
            padding: '16px 28px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.92)',
            color: '#0b2540',
            marginTop: '20px'
          }}
        >
          Continue to Upload Page
        </button>
      </div>

    </main>
  );
}