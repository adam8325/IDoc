import React from "react";
import { useOutput } from "./outputContext";
import { Code, Settings, Users, Loader } from "lucide-react";

// #TODO: Remove debugging logs

export default function Upload({ text, setText, mode, setMode }) {
  const { setOutput, setOutputSource, uploadedFileName, setUploadedFileName } = useOutput();
  const [contextUploaded, setContextUploaded] = React.useState(false);
  const [loadingUpload, setLoadingUpload] = React.useState(false);
  const [loadingGenerate, setLoadingGenerate] = React.useState(false);
  const [] = React.useState("");

  async function generateDoc(e) {
    e?.preventDefault();
    setLoadingGenerate(true);
    setOutput("");

    if (!looksLikeCode(text)) {
      setOutput("Indtast venligst noget kode.");
      setOutputSource("error");
      setLoadingGenerate(false);
      return;
    }

    try {
      if (contextUploaded) {
        const res = await fetch("/api/queryContext", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: text, contextInfo: true, filename: uploadedFileName}),
        });
        console.log("Uploaded filename:", uploadedFileName)
        const data = await res.json();
        console.log("Response context data:", data);
        if (res.ok) {
          setOutput(data.output);
          setOutputSource("context");
        } else setOutput("Fejl: " + (data.detail || data.error || JSON.stringify(data)));
      } else {
        const res = await fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, mode }),
        });
        const data = await res.json();
        console.log("Response summarize data:", data);
        if (res.ok) {
          setOutput(data.output);
          setOutputSource("summarize");
        } else setOutput("Fejl: " + (data.detail || data.error || JSON.stringify(data)));
      }
    } catch (err) {
      setOutput("Netværksfejl: " + String(err));
    } finally {
      setLoadingGenerate(false);
    }
  }

  function handleContextFileUpload(e) {
    setLoadingUpload(true);
    const file = e.target.files[0];
    if (!file) {
      setLoadingUpload(false);
      return;
    }
    setUploadedFileName(file.name);
    console.log("Selected file:", file.name);
    const formData = new FormData();
    formData.append("file", file);

    fetch("/api/uploadContext", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        setContextUploaded(true);
        setLoadingUpload(false);
      })
      .catch((err) => {
        alert("Fejl ved upload");
        setLoadingUpload(false);
      });
  }

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => setText(String(ev.target.result));
    reader.readAsText(f);
  }

 function removeUploadedFile() {
  // Kald backend for at fjerne filen
  fetch('/api/removeContext', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: uploadedFileName }),
  })
    .then(() => {
      setUploadedFileName("");
      setContextUploaded(false);
    })
    .catch(() => {
      setUploadedFileName("");
      setContextUploaded(false);
    });
}

function looksLikeCode(text) {
  const patterns = [
    /\bdef\b/, /\bclass\b/, /\bimport\b/, /\bfunction\b/, /\bpublic\b/, /\bprivate\b/, /\bstatic\b/,
    /\bvoid\b/, /\bint\b/, /\bfloat\b/, /\bstring\b/, /\bvar\b/, /\blet\b/, /\bconst\b/,
    /\breturn\b/, /\bif\b/, /\belse\b/, /\bfor\b/, /\bwhile\b/, /\btry\b/, /\bcatch\b/,
    /\busing\b/, /\bnamespace\b/, /\bextends\b/, /\bimplements\b/, /\binterface\b/,
    /\{/, /\}/, /;/, /\(/, /\)/, /\[/, /\]/, /\/\//, /#/, /\/\*/, /\*\//
  ];
  const matches = patterns.filter(pattern => pattern.test(text)).length;
  return matches >= 2;
}

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
      <section className="bg-white sm:w-5/7 p-4 rounded-lg border-slate-200 border order-2 sm:order-1">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Code className=" rounded-sm h-6 w-6 p-1 h-5 w-5 text-white bg-gradient-to-r from-indigo-400 to-purple-600" />
            <label className="block font-medium">Din kode</label>
          </div>
        </div>
        <textarea
          className="w-full h-64 p-3 font-mono text-sm border-dashed border border-stone-400 rounded-lg "
          placeholder="Indsæt kode her eller upload en fil..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex items-center justify-center gap-2 mt-3">
          <label className="bg-[linear-gradient(135deg,hsl(250_50%_96%),hsl(280_50%_98%))] font-semibold text-black text-xs sm:text-sm px-3 py-1 sm:px-6 sm:py-3 rounded-sm sm:rounded-md cursor-pointer hover:bg-[linear-gradient(90deg,#06b6d4,#6366f1)] hover:text-white" htmlFor="file-upload">
            Upload fil
            <input
              id="file-upload"
              type="file"
              accept=".js,.ts,.py,.java,.txt"
              onChange={handleFile}
              className="hidden"
            />
          </label>
          <button
            onClick={generateDoc}
            disabled={loadingGenerate || !text}
            className={`ml-auto font-semibold rounded-sm sm:rounded-md px-3 py-1 sm:px-6 sm:py-3 text-center text-[10px] sm:text-sm
            ${loadingGenerate || !text
              ? "bg-gray-300 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-400 to-purple-600 text-white hover:cursor-pointer hover:from-indigo-500 hover:to-purple-700"
            }`
          }
          >
             {loadingGenerate ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin w-4 h-4 text-blue" />
                <span>Genererer...</span>
              </div>
            ) : (
              "Generér dokumentation"
            )}
          </button>
        </div>
      </section>
      <section className="flex flex-1 flex-col gap-4 order-1 sm:order-2">
        <div
            className={`flex flex-col items-center gap-4 bg-white p-4 rounded-lg border-slate-200 border 
              ${uploadedFileName ? "opacity-50 pointer-events-none" : ""}`}
          >
            <p className="font-semibold">Dokumentations Type</p>
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setMode("dev")}
                disabled={!!uploadedFileName}
                className={`flex flex-col items-center gap-2 cursor-pointer font-semibold py-2 px-3 sm:py-2 sm:px-3 text-xs sm:text-sm rounded-sm sm:rounded-md 
                  ${mode === "dev"
                    ? "bg-purple-600 text-white"
                    : "bg-[linear-gradient(135deg,hsl(250_50%_96%),hsl(280_50%_98%))]"
                  }`}
              >
                <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                <div className="flex flex-col">
                  <p className="">Teknisk</p>
                  <p className="text-[9px] sm:text-sm text-stone-400">For udviklere</p>
                </div>
              </button>

              <button
                onClick={() => setMode("user")}
                disabled={!!uploadedFileName}
                className={`flex flex-col items-center gap-2 cursor-pointer font-semibold py-2 px-3 text-xs sm:text-sm rounded-sm sm:rounded-md
                  ${mode === "user"
                    ? "bg-purple-600 text-white"
                    : "bg-[linear-gradient(135deg,hsl(250_50%_96%),hsl(280_50%_98%))]"
                  }`}
              >
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <div className="flex flex-col">
                  <p className="">Brugervenlig</p>
                  <p className="text-[9px] sm:text-sm text-stone-400">For brugere</p>
                </div>
              </button>
            </div>
          </div>

        <div className="flex flex-col gap-4 bg-white p-4 rounded-lg border-slate-200 border">
          <div className="flex flex-col items-center">
            <p className="font-semibold">Tilføj Knowledge Base</p>
          </div>
          <p className="text-xs sm:text-sm text-center">Skræddersy dokumentationen i henhold til jeres guidelines og kodestandarder</p>
          <div className="flex flex-col items-center gap-4">
             {uploadedFileName && (
              <div className="flex items-center gap-1">
                <span className="truncate max-w-[120px] text-xs sm:text-sm">{uploadedFileName}</span>
                <button
                  type="button"
                  onClick={removeUploadedFile}
                  className="ml-1 text-red-500 hover:text-red-700 cursor-pointer"
                  tabIndex={0}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            )}
            <label className="bg-[linear-gradient(135deg,hsl(250_50%_96%),hsl(280_50%_98%))] font-semibold w-full text-center text-black text-xs sm:text-sm px-4 py-2 rounded-sm sm:rounded-md cursor-pointer hover:bg-[linear-gradient(90deg,#06b6d4,#6366f1)] hover:text-white">
              {loadingUpload ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader className="animate-spin w-4 h-4 text-blue" />
                  <span className="text-center">Uploader...</span>
                </div>
              ) : (
                "Upload fil"
              )}
              <input
                type="file"
                accept=".js,.ts,.py,.java,.txt"
                onChange={handleContextFileUpload}
                className="hidden"
              />
            </label>
           
          </div>
        </div>
      </section>
    </div>
  );
}