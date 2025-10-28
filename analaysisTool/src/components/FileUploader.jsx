
import React, { useState } from "react";

export default function FileUploader() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  function showLoading() {
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
    const files = Array.from(fileList).map(f => ({
      file: f,
      name: f.name,
      size: (f.size / 1024).toFixed(1) + " KB",
      type: f.name.endsWith('.csv') ? 'CSV' : f.name.endsWith('.xlsx') || f.name.endsWith('.xls') ? 'Excel' : 'Unknown'
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
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
        padding: '40px 32px',
        minWidth: '320px',
        maxWidth: '90vw',
        width: '400px',
        textAlign: 'center',
      }}>
        <h2 style={{marginTop:0}}>Upload Files</h2>
        <input type="file" multiple onChange={handleFileSelect} style={{marginBottom:'16px'}} />
        <br />
        <button onClick={showLoading} style={{marginBottom:'16px'}}>Show Loading</button>
        {loading && (
          <div style={{margin:'16px 0'}}>
            <div>Loading... {progress}%</div>
            <progress value={progress} max="100" style={{width:'100%'}} />
          </div>
        )}
        {showSuccess && <div style={{color:'#16a34a',margin:'12px 0'}}>Done! Files uploaded.</div>}
        <ul style={{textAlign:'left',padding:0,listStyle:'none'}}>
          {selectedFiles.map((file, idx) => (
            <li key={idx} style={{marginBottom:'8px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span>{file.name}</span>
              <button onClick={() => removeFile(idx)} style={{marginLeft:'12px'}}>Remove</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
