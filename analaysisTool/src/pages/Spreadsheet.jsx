import { useEffect, useState } from "react";

export default function Spreadsheet() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    async function fetchMaster() {
      setLoading(true);
      setError("");

      try {
        const saved = localStorage.getItem("masterData");
        if (saved) {
          const cached = JSON.parse(saved);
          setColumns(cached.columns || []);
          setRows(cached.rows || []);
        }

        const res = await fetch("/master", { credentials: "include" });

        if (!res.ok) {
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

        if (masterColumns.length === 0 || masterRows.length === 0) {
          setColumns([]);
          setRows([]);
          localStorage.removeItem("masterData");
          return;
        }

        setColumns(masterColumns);
        setRows(masterRows);

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
    return (
      <p style={{ textAlign: "center", marginTop: "40px" }}>
        Loading master spreadsheet...
      </p>
    );
  }

  if (error) {
    return (
      <p style={{ color: "red", textAlign: "center", marginTop: "40px" }}>
        {error}
      </p>
    );
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        textAlign: "center",
        width: "100%",
        marginTop: "40px",
      }}
    >
      <h1 style={{ marginBottom: "10px" }}>Master Spreadsheet</h1>

      <button
        onClick={handleDownload}
        style={{
          marginBottom: "20px",
          padding: "12px 24px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#45a049")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#4CAF50")}
      >
        Download Master Spreadsheet
      </button>

      <div
        style={{
          overflowX: "auto",
          overflowY: "auto",
          maxHeight: "70vh",
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <table
          border="1"
          cellPadding="6"
          style={{
            borderCollapse: "collapse",
            textAlign: "center",
            backgroundColor: "white",
            color: "black",
            minWidth: "600px",
          }}
        >
          <thead style={{ backgroundColor: "#22304A", color: "white" }}>
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
