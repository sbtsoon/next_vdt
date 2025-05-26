"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AIChatPanel from "@/components/AIChatPanel";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";
import MultiSelect from "@/components/form/MultiSelect";

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
    Array(10).fill({ file: "", field: [], target: "", nodeOrEdge: "" })
  );
  const [showChat, setShowChat] = useState(false);
  const [vizStyles, setVizStyles] = useState<string[]>(["NET", "VDT", "Timeline"]);

  const handleSelectFile = (filename: string) => {
    setSelectedFiles((prev) =>
      prev.includes(filename)
        ? prev.filter((f) => f !== filename)
        : [...prev, filename]
    );
  };

  const handleDeleteFile = (filename: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.name !== filename));
    setSelectedFiles((prev) => prev.filter((f) => f !== filename));
  };

  const handleMappingChange = (index: number, key: string, value: any) => {
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
    router.push("/page");
  };

  const toggleVizStyle = (style: string) => {
    setVizStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  return (
    <div className="p-8 text-white bg-gray-900 min-h-screen relative">
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed top-30 right-4 z-50 bg-brand-500 text-white p-2 rounded-full shadow-lg hover:bg-brand-600"
        aria-label="Toggle AI Chat"
      >
        <ChatBubbleLeftEllipsisIcon className="h-6 w-6" />
      </button>

      {showChat && (
        <div className="fixed top-33 right-0 z-40 w-[350px] h-[480px]">
          <AIChatPanel />
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6">Project Setup - Income Statement</h1>

      <div className="mb-4 flex gap-4">
        <div className="w-1/2">
          <label className="block mb-1">1. Name new project:</label>
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

      <div className="mb-4 py-4">
        <label className="block mb-1">2. Select Visualization Style:</label>
        <div className="flex gap-4">
          {["NET", "VDT", "Timeline", "Geo-map", "Concept"].map((style) => (
            <label key={style} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="accent-brand-500 w-4 h-4 text-brand-500 focus:ring-2 focus:ring-brand-500 checked:bg-brand-500"
                checked={vizStyles.includes(style)}
                onChange={() => toggleVizStyle(style)}
              />
              <span className="text-sm">{style}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-8">
        <div className="flex-1">
          <h2 className="font-bold mb-2">3. Select My Data</h2>
          <label className="inline-block px-4 py-2 mb-4 rounded bg-blue-600 hover:bg-blue-700 cursor-pointer">
            Upload Files
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
          <button className="ml-4 px-4 py-2 bg-green-700 hover:bg-green-800 rounded">Load Data</button>
          <table className="w-full text-left border border-gray-700 mt-4 divide-y divide-gray-600">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-2">file name</th>
                <th className="p-2">DB type</th>
                <th className="p-2">Select</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }).map((_, i) => {
                const file = uploadedFiles[i];
                return (
                  <tr key={i} className="hover:bg-gray-800 transition h-12">
                    <td className="p-2">{file?.name || ""}</td>
                    <td className="p-2">{file ? "RDB" : ""}</td>
                    <td className="p-2">
                      {file && (
                        <input
                          type="checkbox"
                          className="accent-brand-500 w-4 h-4 text-brand-500 focus:ring-2 focus:ring-brand-500 checked:bg-brand-500"
                          checked={selectedFiles.includes(file.name)}
                          onChange={() => handleSelectFile(file.name)}
                        />
                      )}
                    </td>
                    <td className="p-2">
                      {file && (
                        <button
                          className="text-red-400 hover:underline text-sm"
                          onClick={() => handleDeleteFile(file.name)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-start pt-8">
          <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded">
            4. AI map fields
          </button>
          <p className="mt-2 text-sm text-gray-400">ai가 자동으로 매칭합니다.</p>
        </div>

        <div className="flex-1">
          <h2 className="font-bold mb-2">5. Map to Graph DB</h2>
          <table className="w-full text-left border border-gray-700 divide-y divide-gray-600">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-2">file name</th>
                <th className="p-2">field name</th>
                <th className="p-2">target</th>
                <th className="p-2">node/edge</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((map, i) => (
                <tr key={i} className="hover:bg-gray-800 transition h-10">
                  <td className="p-1 px-2">
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
                  <td className="p-1">
                    <MultiSelect
                      options={["name", "code", "amount"]}
                      selected={map.field}
                      onChange={(values: string[]) => handleMappingChange(i, "field", values)}
                    />
                  </td>
                  <td className="p-1">
                    <input
                      className="w-full p-1 bg-gray-800 border border-gray-700"
                      value={map.target}
                      onChange={(e) => handleMappingChange(i, "target", e.target.value)}
                    />
                  </td>
                  <td className="p-1">
                    <select
                      className="w-full p-1 bg-gray-800 border border-gray-700"
                      value={map.nodeOrEdge}
                      onChange={(e) => handleMappingChange(i, "nodeOrEdge", e.target.value)}
                    >
                      <option value="">--</option>
                      <option value="node">node</option>
                      <option value="edge">edge</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded">
          6. Show Graph
        </button>
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
