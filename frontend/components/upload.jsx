import React from "react";
import { useOutput } from "./outputContext";
import { Code, Settings, Users, Loader } from "lucide-react";

export default function Upload({ text, setText, mode, setMode }) {
  const { setOutput, setOutputSource } = useOutput();
  const [contextUploaded, setContextUploaded] = React.useState(false);
  const [loadingUpload, setLoadingUpload] = React.useState(false);
  const [loadingGenerate, setLoadingGenerate] = React.useState(false);

  async function generateDoc(e) {
    e?.preventDefault();
    setLoadingGenerate(true);
    setOutput("");
    try {
      if (contextUploaded) {
        const res = await fetch("/api/queryContext", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: text, contextInfo: true }),
        });
        const data = await res.json();
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
                <Loader className="animate-spin w-4 h-4 text-white" />
                <span>Genererer...</span>
              </div>
            ) : (
              "Generér dokumentation"
            )}
          </button>
        </div>
      </section>
      <section className="flex flex-1 flex-col gap-4 order-1 sm:order-2">
        <div className="flex flex-col items-center gap-4 bg-white p-4 rounded-lg border-slate-200 border">
          <p className="font-semibold">Dokumentations Type</p>
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setMode("dev")}
              className={`flex flex-col items-center gap-2 font-semibold py-2 px-3 sm:py-2 sm:px-3 text-xs sm:text-sm rounded-sm sm:rounded-md hover:cursor-pointer ${
                mode === "dev"
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
              className={`flex flex-col items-center gap-2 font-semibold py-2 px-3 text-xs sm:text-sm rounded-sm sm:rounded-md  hover:cursor-pointer ${
                mode === "user"
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
          <label className="flex justify-center cursor-pointer bg-[linear-gradient(135deg,hsl(250_50%_96%),hsl(280_50%_98%))] hover:bg-[linear-gradient(90deg,#06b6d4,#6366f1)] font-semibold text-black text-xs sm:text-sm px-4 py-2 rounded-sm sm:rounded-md hover:text-white">
            {loadingUpload ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin w-4 h-4 text-white" />
                <span>Uploader...</span>
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
      </section>
    </div>
  );
}