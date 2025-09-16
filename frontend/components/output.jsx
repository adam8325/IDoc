import React from "react";
import { useOutput } from "./outputContext";
import {Copy, Download} from "lucide-react";

export default function Output() {

  const { output, outputSource } = useOutput();

  function copyOutput() {
    if (output) {
      navigator.clipboard.writeText(output);
    }
  }

  function downloadOutput() {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  return(
        <section className="mt-6 bg-white p-4 rounded rounded-lg border-slate-200 border">
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-4'>
            <div>
              <h2 className="text-md sm:text-lg font-semibold">Dokumentation</h2>
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={copyOutput}
                className='py-1 px-2 sm:py-2 sm:px-3 bg-[linear-gradient(135deg,hsl(250_50%_96%),hsl(280_50%_98%))] cursor-pointer flex items-center gap-2 text-[10px] sm:text-sm rounded-lg hover:bg-[linear-gradient(90deg,#00f5d4,#06b6d4)] hover:text-white'>
                <Copy className="h-4 w-4" />
                Kopiér
              </button>
              <button
                onClick={downloadOutput}
                className='py-1 px-2 sm:py-2 sm:px-3  bg-[linear-gradient(135deg,hsl(250_50%_96%),hsl(280_50%_98%))] cursor-pointer flex items-center gap-2 text-[10px] sm:text-sm rounded-lg hover:bg-[linear-gradient(90deg,#00f5d4,#06b6d4)] hover:text-white'>
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
           <div className='mb-2 text-xs'>
            {outputSource === 'context' && '🔹 Brugerens context-fil blev brugt'}
            {outputSource === 'summarize' && '🔹 Opsummering uden context'}
          </div>
          <pre className="whitespace-pre-wrap p-4 rounded-lg text-sm bg-[linear-gradient(135deg,hsl(250_50%_96%),hsl(280_50%_98%))]">{output || 'Ingen output endnu'}</pre>
        </section>
    )
}