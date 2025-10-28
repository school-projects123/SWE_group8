
import React, { useState } from "react";

export default function FileUploader() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [warn, setWarn] = useState("");

  function showLoading() {
    if (selectedFiles.length === 0) {
      setWarn("You have not selected any files.");
      setTimeout(() => setWarn(""), 2000);
      return;
    }
    setWarn("");
    setLoading(true);
    setProgress(50);
    setShowSuccess(false);
    setTimeout(() => {
      setProgress(100);
      setLoading(false);
      setShowSuccess(true);
    }, 1000);
  }

  async function parseFile(fileObj) {
    // fake parse for now, real logic later
    return { filename: fileObj.name, data: [] };
  }

  function handleFileSelect(e) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const allowed = [".csv", ".xls", ".xlsx"];
    const files = Array.from(fileList)
      .filter(f => allowed.some(ext => f.name.toLowerCase().endsWith(ext)))
      .map(f => ({
        file: f,
        name: f.name,
        size: (f.size / 1024).toFixed(1) + " KB",
        type: f.name.endsWith('.csv') ? 'CSV' : 'Excel'
      }));
    setSelectedFiles(prev => [...prev, ...files]);
    e.target.value = '';
  }

  function removeFile(index) {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'none',
    }}>
      <div style={{
        background: '#e5e7eb',
        borderRadius: '18px',
        boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
        padding: '48px 40px',
        minWidth: '340px',
        maxWidth: '95vw',
        width: '480px',
        textAlign: 'center',
      }}>
        <h2 style={{marginTop:0, fontSize:'2rem', fontWeight:600, color:'#222'}}>Upload your files</h2>
        <p style={{color:'#555', fontSize:'1rem', marginBottom:'28px'}}>Select CSV or Excel files to get started.</p>
        <label style={{
          display: 'block',
          border: '2px dashed #b6b6b6',
          borderRadius: '10px',
          padding: '36px 20px',
          background: '#f8fafc',
          cursor: 'pointer',
          marginBottom: '24px',
          transition: 'border 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#2563eb'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#b6b6b6'}>
          <div style={{fontSize:'1.1rem', color:'#222', marginBottom:'8px'}}>Click to select files</div>
          <div style={{fontSize:'0.95rem', color:'#888'}}>CSV, XLS, XLSX supported</div>
          <input type="file" multiple onChange={handleFileSelect} style={{display:'none'}} />
        </label>
        <button onClick={showLoading} style={{
          background:'#2563eb',
          color:'#fff',
          border:'none',
          borderRadius:'8px',
          padding:'12px 32px',
          fontSize:'1rem',
          fontWeight:600,
          marginBottom:'20px',
          cursor:'pointer',
          boxShadow:'0 2px 8px rgba(37,99,235,0.08)',
          transition:'background 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
        onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}>
          Upload Files
        </button>
        {warn && <div style={{color:'#e11d48',marginBottom:'12px',fontWeight:500}}>{warn}</div>}
        {loading && (
          <div style={{margin:'18px 0'}}>
            <div style={{fontWeight:500, color:'#2563eb'}}>Loading... {progress}%</div>
            <progress value={progress} max="100" style={{width:'100%', height:'12px'}} />
          </div>
        )}
        {showSuccess && <div style={{color:'#16a34a',margin:'16px 0', fontWeight:500}}>Done! Files uploaded.</div>}
        <ul style={{textAlign:'left',padding:0,listStyle:'none', marginTop:'18px'}}>
          {selectedFiles.map((file, idx) => (
            <li key={idx} style={{
              marginBottom:'10px',
              display:'flex',
              justifyContent:'space-between',
              alignItems:'center',
              background:'#e5e7eb',
              borderRadius:'6px',
              padding:'10px 14px',
              color:'#222',
              fontWeight:500
            }}>
              <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'70%', color:'#222'}}>{file.name}</span>
              <button onClick={() => removeFile(idx)} style={{marginLeft:'12px', background:'#e11d48', color:'#fff', border:'none', borderRadius:'5px', padding:'4px 12px', cursor:'pointer'}}>Remove</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
