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

  return (
    <div>
      <input type="file" multiple onChange={handleFileSelect} />
      <div>FileUploader</div>
    </div>
  );
}
