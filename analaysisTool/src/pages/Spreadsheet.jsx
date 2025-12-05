import { useEffect, useState } from "react";

export default function Spreadsheet() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMaster() {
      try {
        // Frontend:  http://localhost:5173
        // Backend:   http://localhost:5000
        const res = await fetch("/master");
        const text = await res.text();
        setLoading(true)
        const saved = localStorage.getItem("masterData")
        if (saved) {
          const data = JSON.parse(saved);

          setColumns(data.columns || []);
          setRows(data.rows || []);
          setLoading(false);
          return;
        }
        let data;
        try {
          data = JSON.parse(text);
          alert(JSON.stringify(data))
        } catch (e) {
          console.error("Response was not valid JSON:", text);
          console.log(text)
          setError("Server response was not valid JSON.");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          setError(data.error || "Something went wrong.");
        } else {
          setColumns(data.masterColumns || []);
          setRows(data.masterRows || []);
        }

        localStorage.setItem(
            "masterData",
            JSON.stringify({
              columns: data.masterColumns || [],
              rows: data.masterRows || [],
            })
          );

          setColumns(data.masterColumns || []);
          setRows(data.masterRows || []);

      } catch (err) {
        console.error("Fetch error:", err);
        setError("Could not reach the server.");
      } finally {
        setLoading(false);
      }
    }

    fetchMaster();
  }, []);

  if (loading) {
    return <p>Loading master spreadsheet...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!columns.length || !rows.length) {
    return (
      <p>No master spreadsheet yet. Please upload and process files first.</p>
    );
  }

  return (
    <div>
      <h1>Master Spreadsheet</h1>
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
