import React, { useState } from 'react';

const MemoryExplorer = () => {
  const [parsedLogs, setParsedLogs] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/v1/logs/parse', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log("PARSE RESPONSE:", result);

      if (result.success && Array.isArray(result.data)) {
        setParsedLogs(result.data);
      } else {
        console.warn("Unexpected response:", result);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: '1rem', color: '#fff' }}>
      <h2>LLM Log Viewer</h2>
      <input type="file" accept=".jsonl" onChange={handleFileUpload} />

      {loading && <p>Loading logs...</p>}

      {parsedLogs && parsedLogs.length > 0 && (
        <div>
          <h3>Parsed Logs:</h3>
          {parsedLogs.map((entry, i) => (
            <div key={i} style={{ borderBottom: '1px solid #333', padding: '6px 0' }}>
              <strong>{entry.timestamp}</strong><br />
              <span>{entry.event_type} — {entry.source_agent}</span><br />
              <em>{entry.summary}</em><br />
              {entry.response && <p style={{ color: '#aaa'}}>{entry.response}</p>}
              {entry.tokens && <span>Token=: (entry.tokens), Time:
              {entry.duration_ms}ms</span>}
              {entry.error && <p style={{ color: 'red' }}>Error: {entry.error}</p>}
            </div>
          ))}
        </div>
      )}

      {parsedLogs && parsedLogs.length === 0 && (
        <p>No log entries found.</p>
      )}
    </div>
  );
};

export default MemoryExplorer;
