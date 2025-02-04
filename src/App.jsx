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
      <div className="w-full max-w-full p-6 space-y-6 bg-white rounded-lg shadow-lg md:max-w-3xl">
        {/* File Upload Form */}
        <form onSubmit={handleFileSave} className="space-y-4">
          <h2 className="text-xl font-semibold text-center md:text-left">
            File Storage App
          </h2>
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <input
              type="file"
              id="file-input"
              onChange={handleFileChange}
              className="w-full p-2 border rounded-md"
            />
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>

        {/* File List */}
        <div>
          <h2 className="text-xl font-semibold">File List</h2>
          <ul className="p-4 list-none rounded-md shadow-md bg-gray-50">
            {fileList.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2 mb-2 bg-white border rounded-md shadow-sm"
              >
                <li
                  className="w-3/4 text-blue-600 truncate cursor-pointer hover:underline"
                  onClick={() => handleDisplayFile(file.id)}
                  title={file.name}
                >
                  {file.name}
                </li>
                <span
                  className="px-2 text-red-500 cursor-pointer hover:text-red-600"
                  onClick={() => handleDeleteFile(file.id)}
                >
                  Delete
                </span>
              </div>
            ))}
          </ul>
        </div>

        {/* File Preview */}
        <div>
          <h2 className="text-xl font-semibold">File Preview</h2>
          {displayFile ? (
            displayFile.type.includes("image") ? (
              // Image Preview
              <div className="flex justify-center">
                <img
                  src={displayFile.url}
                  alt={displayFile.name}
                  className="object-contain max-w-full rounded-md shadow-md"
                />
              </div>
            ) : displayFile.type.includes("pdf") ? (
              // PDF Preview
              <iframe
                src={displayFile.url}
                title={displayFile.name}
                className="w-full h-[500px] border rounded-md shadow"
              />
            ) : (
              <p className="text-center text-gray-500">Preview not available</p>
            )
          ) : (
            <p className="text-center text-gray-500">No file selected</p>
          )}
        </div>
      </div>
    </div>
  );
}
