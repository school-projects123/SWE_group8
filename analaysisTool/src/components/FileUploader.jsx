import React, { useState, useRef } from "react";

export default function FileUploader() {
  //define states
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [warn, setWarn] = useState("");

  //function sets restrictions for if file is chosen and which file types are allowed
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
    //NEED TO MAKE THE CORRUPTION LOGIC WORK
    const hasCorrupt = selectedFiles.some((f) =>
      f.name.toLowerCase().includes("corrupt")
    );
    setTimeout(() => {
      setProgress(100);
      setLoading(false);
      if (hasCorrupt) {
        setWarn("This file could not be read or is corrupted.");
        setTimeout(() => setWarn(""), 2500);
      } else {
        setShowSuccess(true);
      }
    }, 1000);
  }

  //once files are selected, this function processes them - their names & types are extracted - NEEDTO MAKE WORL
  async function parseFile(fileObj) {
    return { filename: fileObj.name, data: [] };
  }

  // should probubly limit the size of files that can be uploaded? or the number of files or both
  //main part of the page with the upload button and file selection area
  function handleFileSelect(e) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const allowed = [".csv", ".xls", ".xlsx"];
    let badFile = false;
    const files = Array.from(fileList)
      .filter((f) => {
        const ok = allowed.some((ext) => f.name.toLowerCase().endsWith(ext));
        if (!ok) badFile = true;
        return ok;
      })
      .map((f) => ({
        file: f,
        name: f.name,
        size: (f.size / 1024).toFixed(1) + " KB",
        type: f.name.endsWith(".csv") ? "CSV" : "Excel",
      }));
    if (badFile) {
      setWarn(
        "This file is not compatible. Only CSV or Excel files are allowed."
      );
      setTimeout(() => setWarn(""), 2500);
    }
    setSelectedFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  }

  //this function removes a selected file from the list of previously selected files
  function removeFile(index) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  // this function is sending the Files to backend
  // is async because it will probubly take time to send files and this allows the page to stay responsive
  async function sendInfo() {
    // sending file content as form data because json would be too slow
    const formData = new FormData();

    selectedFiles.forEach((fileObj, i) => {
      formData.append(`file_${i}`, fileObj.file);
      //formData.append(`course_${i}`,fileObj.course || "") //not yet implemented course selection
    });
    formData.append("numOfFiles", selectedFiles.length);
    try {
      // local host temp till we get a domain name and hosting
      const res = await fetch("http://127.0.0.1:5000/process", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("Backend responce:", data);
      // not showing up because it is called after the await because browsers block popups outside user-click events
      alert(JSON.stringify(data));
      localStorage.setItem("masterData", JSON.stringify({
        columns: data.masterColumns,
        rows: data.masterRows
      }));
      // switch to page where info was sent
      window.location.href = "/app/spreadsheet"

      
    } catch (err) {
      console.error("error sending to backend:", err);
    }
  }
  function getInfo(){
    // is called once info is sent to process in backend#
    // takes responce from backend and gives it to the spreadsheep page

  }

  //Style and structure of the upload page
  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        boxSizing: "border-box",
        padding: "env(safe-area-inset-top) 16px env(safe-area-inset-bottom)",
        background: "#22304a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        overflow: "auto",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
          marginTop: "40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 1,
          padding: "0 16px",
        }}
      >
        <header
          style={{
            width: "100%",
            textAlign: "center",
            marginBottom: "28px",
            outline: "none",
          }}
          aria-label="Analysis Tool main heading"
        >
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: 900,
              fontFamily: "Inter, Segoe UI, Arial, sans-serif",
              letterSpacing: "-2px",
              margin: 0,
              color: "#fff",
              textShadow: "0 2px 12px rgba(0,0,0,0.18)",
              lineHeight: 1.08,
            }}
          >
            Student Analysis Tool
          </h1>
        </header>
        <div
          style={{
            background: "#e5e7eb",
            borderRadius: "18px",
            boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
            padding: "48px 40px",
            minWidth: "340px",
            maxWidth: "95vw",
            width: "480px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: "2rem",
              fontWeight: 600,
              color: "#222",
            }}
          >
            Upload your files
          </h2>
          <p
            style={{
              color: "#111",
              fontSize: "1.08rem",
              marginBottom: "28px",
              fontWeight: 700,
              letterSpacing: "-0.2px",
              textShadow: "0 2px 8px rgba(0,0,0,0.10)",
            }}
          >
            Select CSV or Excel files to get started.
          </p>
          <label
            style={{
              display: "block",
              border: "2px dashed #b6b6b6",
              borderRadius: "10px",
              padding: "36px 20px",
              background: "#f8fafc",
              cursor: "pointer",
              marginBottom: "24px",
              transition: "border 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "#2563eb")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "#b6b6b6")
            }
          >
            <div
              style={{ fontSize: "1.1rem", color: "#222", marginBottom: "8px" }}
            >
              Click to select files
            </div>
            <div style={{ fontSize: "0.95rem", color: "#888" }}>
              CSV, XLS, XLSX supported
            </div>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
          </label>
          <button
            //maybe in next commit make an handleUploadClick fuction so its cleaner
            onClick={() => {
              showLoading();
              sendInfo();
            }}
            style={{
              background: "#19306a",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "12px 32px",
              fontSize: "1rem",
              fontWeight: 600,
              marginBottom: "20px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(37,99,235,0.08)",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#14204a")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#19306a")}
          >
            Generate Report
          </button>
          {warn && (
            <div
              style={{
                color: "#e11d48",
                marginBottom: "12px",
                fontWeight: 500,
              }}
            >
              {warn}
            </div>
          )}
          {loading && (
            <div style={{ margin: "18px 0" }}>
              <div style={{ fontWeight: 500, color: "#2563eb" }}>
                Loading... {progress}%
              </div>
              <progress
                value={progress}
                max="100"
                style={{ width: "100%", height: "12px" }}
              />
            </div>
          )}
          {showSuccess && (
            <div
              style={{ color: "#16a34a", margin: "16px 0", fontWeight: 500 }}
            >
              Done! Files uploaded.
            </div>
          )}
          <ul
            style={{
              textAlign: "left",
              padding: 0,
              listStyle: "none",
              marginTop: "18px",
            }}
          >
            {selectedFiles.map((file, idx) => (
              <li
                key={idx}
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#e5e7eb",
                  borderRadius: "6px",
                  padding: "10px 14px",
                  color: "#222",
                  fontWeight: 500,
                }}
              >
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "70%",
                    color: "#222",
                  }}
                >
                  {file.name}
                </span>
                <button
                  onClick={() => removeFile(idx)}
                  style={{
                    marginLeft: "12px",
                    background: "#e11d48",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    padding: "4px 12px",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
