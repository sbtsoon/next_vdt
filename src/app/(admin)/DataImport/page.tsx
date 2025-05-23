"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AIChatPanel from "@/components/AIChatPanel";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";

const DataImportPage: React.FC = () => {
  const router = useRouter();
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([
    new File([], "project1.xlsx"),
    new File([], "project2.db"),
    new File([], "project3.db")
  ]);
  const [mappings, setMappings] = useState(
    Array(5).fill({ file: "", field: "", nodeOrEdge: "" })
  );
  const [showChat, setShowChat] = useState(false);
  const [vizStyles, setVizStyles] = useState<string[]>([]);

  const handleSelectFile = (filename: string) => {
    setSelectedFiles((prev) =>
      prev.includes(filename)
        ? prev.filter((f) => f !== filename)
        : [...prev, filename]
    );
  };

  const handleMappingChange = (index: number, key: string, value: string) => {
    const updated = [...mappings];
    updated[index] = { ...updated[index], [key]: value };
    setMappings(updated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const handleSaveProject = () => {
    router.push("/");
  };

  const toggleVizStyle = (style: string) => {
    setVizStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  return (
    <div className="p-8 text-white bg-gray-900 min-h-screen relative">
      {/* AI Toggle Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed top-4 right-4 z-50 bg-brand-500 text-white p-2 rounded-full shadow-lg hover:bg-brand-600"
        aria-label="Toggle AI Chat"
      >
        <ChatBubbleLeftEllipsisIcon className="h-6 w-6" />
      </button>

      {/* AI Chat Panel */}
      {showChat && (
        <div className="fixed top-16 right-0 z-40 w-[350px] h-[480px]">
          <AIChatPanel />
        </div>
      )}

      {/* Header */}
      <h1 className="text-2xl font-bold mb-6">Project Setup - Income Statement</h1>

      {/* Step 1 - Project Name and Type */}
      <div className="mb-4 flex gap-4">
        <div className="w-1/2">
          <label className="block mb-1"> Name new project:</label>
          <input
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter project name"
          />
        </div>
        <div className="w-1/2">
          <label className="block mb-1">Select Project Type:</label>
          <select
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
          >
            <option value="">Select type</option>
            <option value="Income Statement1">Income Statement1</option>
            <option value="Income Statement2">Income Statement2</option>
            <option value="Income Statement3">Income Statement3</option>
          </select>
        </div>
      </div>

      {/* Step 2 - Visualization Style */}
      <div className="mb-4 py-4">
        <label className="block mb-1">Select Visualization Style:</label>
        <div className="flex gap-4">
          {["NET", "VDT", "Timeline", "Geo-map", "Concept"].map((style) => (
            <label key={style} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="accent-brand-500 w-4 h-4 appearance-none cursor-pointer dark:border-gray-700 border border-gray-300 checked:border-transparent rounded-md checked:bg-brand-500 disabled:opacity-60
          "
                checked={vizStyles.includes(style)}
                onChange={() => toggleVizStyle(style)}
              />
              <span className="text-sm">{style}</span>
            </label>
          ))}

        </div>
      </div>

      {/* Step 3 - Select My Data */}
      <div className="flex gap-8">
        <div className="flex-1">
          <h2 className="font-bold mb-2">3. Select My Data</h2>
          <input
            type="file"
            multiple
            className="mb-4"
            onChange={handleFileUpload}
          />
          <table className="w-full text-left border border-gray-700">
            <thead>
              <tr>
                <th className="p-2">file name</th>
                <th className="p-2">DB type</th>
                <th className="p-2">Select</th>
              </tr>
            </thead>
            <tbody>
              {uploadedFiles.map((file) => (
                <tr key={file.name}>
                  <td className="p-2">{file.name}</td>
                  <td className="p-2">RDB</td>
                  <td className="p-2">
                    <input
                      type="checkbox"
                      className="accent-brand-500 w-4 h-4 text-brand-500 focus:ring-2 focus:ring-brand-500"
                      checked={selectedFiles.includes(file.name)}
                      onChange={() => handleSelectFile(file.name)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Step 5 - Map Fields */}
        <div className="flex-1">
          <h2 className="font-bold mb-2">5. Map to Graph DB</h2>
          <table className="w-full text-left border border-gray-700">
            <thead>
              <tr>
                <th className="p-2">file name</th>
                <th className="p-2">field name</th>
                <th className="p-2">node/edge</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((map, i) => (
                <tr key={i}>
                  <td className="p-2">
                    <select
                      className="bg-gray-800 border border-gray-700 p-1"
                      value={map.file}
                      onChange={(e) => handleMappingChange(i, "file", e.target.value)}
                    >
                      <option value="">--</option>
                      {selectedFiles.map((file) => (
                        <option key={file} value={file}>
                          {file}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      className="w-full p-1 bg-gray-800 border border-gray-700"
                      value={map.field}
                      onChange={(e) => handleMappingChange(i, "field", e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      className="w-full p-1 bg-gray-800 border border-gray-700"
                      value={map.nodeOrEdge}
                      onChange={(e) => handleMappingChange(i, "nodeOrEdge", e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-4">
        <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded">4. AI map fields</button>
        <button className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded">6. Show Graph</button>
        <button
          className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded"
          onClick={handleSaveProject}
        >
          7. Save Project
        </button>
      </div>

      <p className="mt-4 text-pink-400">단계별 잘못하면 에러 메시지 나온다</p>
    </div>
  );
};

export default DataImportPage;
