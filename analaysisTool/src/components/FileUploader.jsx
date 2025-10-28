import React, { useState } from "react";

export default function FileUploader() {
  const [selectedFiles, setSelectedFiles] = useState([]);

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
    <div>
      <input type="file" multiple onChange={handleFileSelect} />
      <ul>
        {selectedFiles.map((file, idx) => (
          <li key={idx}>
            {file.name} <button onClick={() => removeFile(idx)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
