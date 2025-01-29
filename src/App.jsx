import "./App.css";
import { useState } from "react";
import { openDB } from "idb";

function App() {
  const [results, setResults] = useState([]);
  const [fileName, setFileName] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);

  // Initialize IndexedDB
  const initDB = async () => {
    return openDB("pdfBenchmarkDB", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("pdfs")) {
          db.createObjectStore("pdfs", { keyPath: "name" });
        }
      },
    });
  };

  // Handle File Upload and Benchmark
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setFileName(file.name);

    // Convert PDF file to Blob
    const fileBlob = new Blob([await file.arrayBuffer()], { type: file.type });

    console.log(
      `\nBenchmarking PDF: ${file.name} (${(fileBlob.size / 1024 / 1024).toFixed(2)} MB)`
    );

    const db = await initDB();

    // Measure Write Time
    const startWrite = performance.now();
    await db.put("pdfs", { name: file.name, file: fileBlob });
    const endWrite = performance.now();
    const writeTime = (endWrite - startWrite).toFixed(2);

    // Measure Read Time
    const startRead = performance.now();
    const storedData = await db.get("pdfs", file.name);
    // Convert Blob to Object URL to Display PDF
    if (storedData?.file) {
      const pdfBlob = storedData.file;
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfUrl); // Save the URL for rendering
    }
    const endRead = performance.now();
    const readTime = (endRead - startRead).toFixed(2);

    console.log(`Write Time: ${writeTime} ms`);
    console.log(`Read Time: ${readTime} ms`);

    // Update Results
    setResults((prev) => [
      ...prev,
      {
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        writeTime,
        readTime,
      },
    ]);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>PDF IndexedDB Benchmark</h2>

      <input type="file" accept="application/pdf" onChange={handleFileUpload} />

      {fileName && <p>Testing file: {fileName}</p>}

      {results.length > 0 && (
        <table border="1" style={{ marginTop: "20px", width: "100%" }}>
          <thead>
            <tr>
              <th>File Size</th>
              <th>Write Time (ms)</th>
              <th>Read Time (ms)</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td>{result.fileSize}</td>
                <td>{result.writeTime}</td>
                <td>{result.readTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Show PDF in iframe */}
      {pdfUrl && (
        <div>
          <h3>Stored PDF Preview</h3>
          <iframe
            src={pdfUrl}
            width="100%"
            height="500px"
            title="Stored PDF"
            style={{ border: "1px solid black" }}
          ></iframe>
        </div>
      )}
    </div>
  );
}

export default App;
