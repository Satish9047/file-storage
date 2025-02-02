import { useEffect, useState } from "react";
import { openDB } from "idb";

const DB_NAME = "fileStoreDB";
const STORE_NAME = "files";

const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    },
  });
};

export default function App() {
  const [inputFile, setInputFile] = useState("");
  const [fileList, setFileList] = useState([]);
  const [displayFile, setDisplayFile] = useState(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const fileList = await store.getAll();
    setFileList(fileList);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setInputFile(file);
  };

  const handleFileSave = async (e) => {
    e.preventDefault();
    if (!inputFile) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const newFile = {
        id: Date.now(),
        name: inputFile.name,
        type: inputFile.type,
        size: inputFile.size,
        data: event.target.result,
      };

      const db = await initDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      await store.add(newFile);
      setFileList((prev) => [...prev, newFile]);
      setInputFile(null);
      document.getElementById("file-input").value = "";
    };
    reader.readAsArrayBuffer(inputFile);
  };

  const handleDisplayFile = async (fileId) => {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const file = await store.get(Number(fileId));

    if (file) {
      const blob = new Blob([file.data], { type: file.type });
      const fileURL = URL.createObjectURL(blob);
      setDisplayFile({ ...file, url: fileURL });
    }
  };

  const handleDeleteFile = async (fileId) => {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    await store.delete(fileId);
    setFileList((prev) => prev.filter((file) => file.id !== fileId));
  };

  return (
    <div className="flex justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-3xl p-6 space-y-6 bg-white rounded-lg shadow-lg">
        <form onSubmit={handleFileSave} className="space-y-4">
          <h2 className="text-xl font-semibold">File Storage app</h2>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              id="file-input"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
            />
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
        <div>
          <h2 className="text-xl font-semibold">File List</h2>
          <ul className="p-4 list-disc list-inside rounded shadow bg-gray-50">
            {fileList.map((file) => (
              <div
                key={file.id}
                className="flex justify-between text-blue-600 cursor-pointer hover:underline"
              >
                <li onClick={() => handleDisplayFile(file.id)}>{file.name}</li>
                <span
                  className="text-red-400"
                  onClick={() => handleDeleteFile(file.id)}
                >
                  Delete
                </span>
              </div>
            ))}
          </ul>
        </div>
        <div>
          <h2>File Preview</h2>
          {displayFile ? (
            <iframe
              src={displayFile.url}
              title={displayFile.name}
              width="100%"
              height="700px"
            />
          ) : (
            <p className="text-gray-500">No file selected</p>
          )}
        </div>
      </div>
    </div>
  );
}
