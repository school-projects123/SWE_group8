import { useEffect, useState } from "react";

export default function Spreadsheet() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMaster() {
      setLoading(true);
      setError("");

      try {
        // OPTIONAL: if you still want to show cached data instantly
        const saved = localStorage.getItem("masterData");
        if (saved) {
          const cached = JSON.parse(saved);
          setColumns(cached.columns || []);
          setRows(cached.rows || []);
        }

        const res = await fetch("/master", { credentials: "include" });

        if (!res.ok) {
          // Friendly message (not technical)
          setError(
            "We couldn’t load the spreadsheet right now. Please try again.",
          );
          setColumns([]);
          setRows([]);
          return;
        }

        const data = await res.json();

        const masterColumns = data.masterColumns || [];
        const masterRows = data.masterRows || [];

        // ✅ If user hasn’t uploaded anything yet, this is NOT an error
        if (masterColumns.length === 0 || masterRows.length === 0) {
          setColumns([]);
          setRows([]);

          // Clear cached data so it doesn’t show an old spreadsheet
          localStorage.removeItem("masterData");
          return;
        }

        setColumns(masterColumns);
        setRows(masterRows);

        // Cache the latest spreadsheet for refreshes
        localStorage.setItem(
          "masterData",
          JSON.stringify({ columns: masterColumns, rows: masterRows }),
        );
      } catch (err) {
        console.error("Fetch error:", err);
        setError(
          "We couldn’t connect to the server. Please check it’s running.",
        );
        setColumns([]);
        setRows([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMaster();
  }, []);

  if (loading) {
    return <p>Loading master spreadsheet...</p>;
  }

  const handleDownload = async () => {
    try {
      const res = await fetch("/master/download", {
        credentials: "include",
      });
      
      if (!res.ok) {
        alert("Failed to download spreadsheet");
        return;
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "master_spreadsheet.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download error:", err);
      alert("Could not download the spreadsheet");
    }
  };

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!columns.length || !rows.length) {
    return (
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <p style={{ fontSize: "18px" }}>
          No spreadsheet yet. Please upload your files on the Upload page first.
        </p>
        <button
          onClick={() => (window.location.href = "/app")}
          style={{
            marginTop: "16px",
            padding: "12px 24px",
            background: "#22304A",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Go to Upload Page
        </button>
      </div>
    );
  }

  return (
    <div>

      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        marginBottom: "1rem", 
        marginLeft: "1rem",
      }}>
      <h1>Master Spreadsheet</h1>
            <button 
        onClick={handleDownload}
        style={{
          marginBottom: "1rem",
          marginTop: "2rem",
          marginRight: "40rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "1rem"
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = "#45a049"}
        onMouseOut={(e) => e.target.style.backgroundColor = "#4CAF50"}
      >
        Download Master Spreadsheet
      </button>
      </div>
      <div style={{ overflowX: "auto", maxHeight: "70vh", overflowY: "auto" }}>
        <table border="1" cellPadding="4">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col}>{row[col]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
