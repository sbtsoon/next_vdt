"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AIChatPanel from "@/components/AIChatPanel";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";




const fieldMappings: Record<string, string> = {
  "매출이익": "Gross Profit",
  "매출액": "Sales Revenue",
  "매출원가": "COGS",
  "당기제품제조원가": "COGM",
  "기말재고": "Ending",
  "기초재고": "Beginning",
  "재공품": "WIP",
  "생산입고": "G R P",
  "공정출고": "G I P",
  "원재료비": "Direct Materials Cost",
  "부재료비": "Indirect Materials Cost",
  "가공비": "Conversion Cost ",
  "액티비티 배부": "Activity Allocation",
  "contribute_to": "contribute_to"
};

const fieldOptions = Object.entries(fieldMappings).map(([value, text]) => ({
  value,
  text
}));

const DataImportPage: React.FC = () => {
  const router = useRouter();
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([
    new File([], "project1.xlsx"),
    new File([], "project2.db"),
    new File([], "SAP_etl.db"),
    new File([], "project3.db")
  ]);
  const [mappings, setMappings] = useState(
    Array(10).fill({ file: "", field: [], target: "", nodeOrEdge: "" })
  );
  const [showChat, setShowChat] = useState(false);
  const [vizStyles, setVizStyles] = useState<string[]>(["Net Graph", "Simulation", "Timeline"]);

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
    setMappings((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };

      if (key === "field" && typeof value === "string") {
        const target = fieldMappings[value] || "";
        updated[index].target = target;
      }

      return updated;
    });
  };

  const handleAIMapFields = () => {
    const defaultFields = [
      { file: "project1.xlsx", field: "매출이익" },
      { file: "project1.xlsx", field: "매출원가" },
      { file: "SAP_etl.db", field: "기말재고" },
      { file: "project2.db", field: "액티비티 배부" },
    ];

    const updated = mappings.map((map, i) => {
      if (i < defaultFields.length) {
        const { file, field } = defaultFields[i];
        const target = fieldMappings[field];
        return {
          file,
          field,
          target,
          nodeOrEdge: ""
        };
      }
      return { ...map, file: "", field: "", target: "", nodeOrEdge: "" };
    });

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
    <div className="p-8 text-white bg-gray-900 min-h-screen relative z-0">
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
            <option value="Income Statement1">BOM</option>
            <option value="Income Statement2">Organization</option>
            <option value="Income Statement3">Flow Detection</option>
          </select>
        </div>
      </div>

      <div className="mb-4 py-4">
        <label className="block mb-1">2. Select Visualization Style:</label>
        <div className="flex gap-4">
          {["Net Graph", "Simulation", "Timeline", "Geo-map", "Concept"].map((style) => (
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
          <div className=" flex justify-end">
          <label className="inline-block px-4 py-1  rounded bg-gray-700 hover:bg-blue-700 cursor-pointer">
            Upload Files
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
          <button className="ml-4 px-4 py-1 border  border-gray-700 hover:border-gray-800 rounded">Load Data</button>
          </div>
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
              {Array.from({ length: 12 }).map((_, i) => {
                const file = uploadedFiles[i];
                return (
                  <tr key={i} className="hover:bg-gray-800 transition h-12">
                    <td className="p-2 border-b  border-gray-700">{file?.name || ""}</td>
                    <td className="p-2 border-b  border-gray-700">{file ? "RDB" : ""}</td>
                    <td className="p-2 border-b  border-gray-700">
                      {file && (
                        <input
                          type="checkbox"
                          className="accent-brand-500 w-4 h-4 text-brand-500 focus:ring-2 focus:ring-brand-500 checked:bg-brand-500"
                          checked={selectedFiles.includes(file.name)}
                          onChange={() => handleSelectFile(file.name)}
                        />
                      )}
                    </td>
                    <td className="p-2 border-b  border-gray-700">
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

        <div className="flex flex-col items-center justify-center ">
          <button onClick={handleAIMapFields}  className="px-6 py-2 bg-purple-800 hover:bg-purple-800 rounded">
          Convert to Graph DB
          </button>
          <p className="mt-2 text-sm text-gray-400">AI를 사용한 변환이니, 틀릴 수 있습니다</p>
        </div>

        <div className="flex-1">
          <h2 className="font-bold mb-2">Map to Graph DB</h2>
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
              <tr key={i} className="hover:bg-gray-700">
                <td className="p-2">
                  <select
                    className="bg-gray-800 border border-gray-700 p-1 w-full"
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
                <select
                    className="bg-gray-800 border border-gray-700 p-1 w-full"
                    value={map.field}
                    onChange={(e) => handleMappingChange(i, "field", e.target.value)}
                  >
                    <option value="">--</option>
                    {fieldOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.text}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    className="bg-gray-800 border border-gray-700 p-1 w-full"
                    value={map.target}
                    readOnly
                  />
                </td>
                <td className="p-2">
                  <select
                    className="bg-gray-800 border border-gray-700 p-1 w-full"
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

      <div className="mt-6 flex gap-4 justify-end border-t border-gray-700 py-3">

        <button
          className="px-6 py-2 bg-brand-600 hover:bg-yellow-700  rounded">
          Save Project
        </button>
        <button className="px-6 py-2 bg-green-700 hover:bg-green-700 rounded"
         onClick={handleSaveProject}>
         Show Graph
        </button>
        <button className="px-6 py-2 bg-dark-900 hover:bg-dark-700 rounded">
      export data
        </button>
      </div>


    </div>
  );
};

export default DataImportPage;