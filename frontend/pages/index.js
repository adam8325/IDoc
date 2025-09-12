// frontend/pages/index.js
import { useState } from 'react'
import { Code, FileCode, Copy, Download, Settings, Users } from "lucide-react";

export default function Home() {
  const [text, setText] = useState('')
  const [mode, setMode] = useState('user') // 'dev' eller 'user'
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState('')

  async function generateDoc(e) {
    e?.preventDefault()
    setLoading(true)
    setOutput('')
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ text, mode }),
      })
      const data = await res.json()
      if (res.ok) setOutput(data.output)
      else setOutput('Fejl: ' + (data.detail || data.error || JSON.stringify(data)))
    } catch (err) {
      setOutput('Netværksfejl: ' + String(err))
    } finally { setLoading(false) }
  }

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

  function handleFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = (ev) => setText(String(ev.target.result))
    reader.readAsText(f)
  }

  return (
    <div className="min-h-screen w-3/4 flex flex-col mx-auto border border-stone-100 rounded-sm ">
     {/* Header */}
      <header className="border-b w-full h-full border border-stone-200 bg-white rounded-t p-4">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div>
              <FileCode className="rounded-xl h-9 w-9 p-1.5 text-white bg-gradient-to-r from-indigo-400 to-purple-600" />
            </div>
            <div>
              <h1
                className="text-2xl font-bold bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent"
              >
                DocIt
              </h1>
              <p className="text-sm text-muted-foreground">
                AI-drevet generator til kodedokumentation
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className='py-4 px-6 flex flex-col gap-4 bg-[linear-gradient(135deg,hsl(250_50%_96%),hsl(280_50%_98%))]'>
         <div className="text-center py-4">           
            <h2 className="text-2xl font-bold mb-3">
              Fra kode til klarhed – på få sekunder
            </h2>
            <p className="text-md text-muted-foreground max-w-2xl mx-auto">
              Omdan din kode til klar og fyldestgørende dokumentation. 
              Vælg mellem teknisk dokumentation til udviklere eller brugervenlige guides til alle.
            </p>
          </div>
        <div className='flex justify-between gap-4'>
            <section className="bg-white w-5/7 p-4 rounded-lg border-slate-200 border">
              <div className='flex items-center justify-between py-4'>
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
                <div className="flex items-center gap-3 mt-3">
                  <label className="bg-[linear-gradient(135deg,hsl(250_50%_96%),hsl(280_50%_98%))] font-semibold text-black text-xs px-4 py-2 rounded cursor-pointer hover:bg-[linear-gradient(90deg,#00f5d4,#06b6d4)] hover:text-white" htmlFor="file-upload">
                    Upload fil
                    <input
                      id="file-upload"
                      type="file"
                      accept=".js,.ts,.py,.java,.txt"
                      onChange={handleFile}
                      className="hidden"
                    />
                  </label>
                  <button onClick={generateDoc} disabled={loading} className="ml-auto bg-gradient-to-r from-indigo-400 to-purple-600 text-white font-semibold rounded-lg px-6 py-3 text-center px-2 py-1 text-sm hover:cursor-pointer hover:from-indigo-500 hover:to-purple-700">
                    {loading ? 'Genererer...' : 'Generér dokumentation'}
                  </button>
                </div>
            </section>        
            <section className='flex flex-1 flex-col gap-4'>
              <div className='flex flex-col items-center gap-4 bg-white p-4 rounded-lg border-slate-200 border'>
                  <p className='font-semibold'>Dokumentations Type</p>
                    <div className="flex items-center justify-between gap-2">
                      <button onClick={() => setMode('dev')} className={`flex flex-col items-center gap-2 font-semibold py-2 px-4.5 text-xs rounded-lg hover:cursor-pointer ${mode==='dev' ? 'bg-purple-600 text-white' : 'bg-[linear-gradient(135deg,hsl(250_50%_96%),hsl(280_50%_98%))]'}`}>
                        <Settings className="h-3 w-3" />
                        <div className='flex flex-col'>
                          <p className=''>Teknisk</p>
                        <p className='text-[9px] text-stone-400'>For udviklere</p>
                        </div>
                        
                      </button>
                      <button onClick={() => setMode('user')} className={`flex flex-col items-center gap-2 font-semibold py-2 px-3 text-xs rounded-lg hover:cursor-pointer ${mode==='user' ? 'bg-purple-600 text-white' : 'bg-[linear-gradient(135deg,hsl(250_50%_96%),hsl(280_50%_98%))]'}`}>
                        <Users className="h-3 w-3" />
                        <div className='flex flex-col'>
                          <p className=''>Brugervenlig</p>
                        <p className='text-[9px] text-stone-400'>For brugere</p>
                        </div>
                        
                      </button>
                    </div>
              </div>
                  
              <div className='flex flex-col gap-4 bg-white p-4 rounded-lg border-slate-200 border'>
                <p className='font-semibold text-sm'>Tilføj Knowledge Base (Beta)</p>
                <p className='text-xs text-center'>Skræddersy dokumentationen i henhold til jeres guidelines og kodestandarder</p>
                 <label className="flex justify-center bg-[linear-gradient(135deg,hsl(250_50%_96%),hsl(280_50%_98%))] font-semibold text-black text-xs px-4 py-2 rounded cursor-pointer hover:bg-[linear-gradient(90deg,#00f5d4,#06b6d4)] hover:text-white" htmlFor="file-upload">
                    Upload filer
                    <input
                      id="file-upload"
                      type="file"
                      accept=".js,.ts,.py,.java,.txt"
                      // onChange={handleFile}
                      className="hidden"
                    />
                  </label>
              </div>
            </section>
        </div>
        

        <section className="mt-6 bg-white p-4 rounded rounded-lg border-slate-200 border">
          <div className='flex items-center justify-between py-4'>
            <div>
              <h2 className="font-semibold">Dokumentation</h2>
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={copyOutput}
                className='py-2 px-3 bg-[linear-gradient(135deg,hsl(250_50%_96%),hsl(280_50%_98%))] cursor-pointer flex items-center gap-2 text-xs rounded-lg hover:bg-[linear-gradient(90deg,#00f5d4,#06b6d4)] hover:text-white'>
                <Copy className="h-4 w-4" />
                Kopiér
              </button>
              <button
                onClick={downloadOutput}
                className='py-2 px-3 bg-[linear-gradient(135deg,hsl(250_50%_96%),hsl(280_50%_98%))] cursor-pointer flex items-center gap-2 text-xs rounded-lg hover:bg-[linear-gradient(90deg,#00f5d4,#06b6d4)] hover:text-white'>
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
          <pre className="whitespace-pre-wrap p-4 rounded-lg text-sm bg-[linear-gradient(135deg,hsl(250_50%_96%),hsl(280_50%_98%))]">{output || 'Ingen output endnu'}</pre>
        </section>
      </main>
      
    </div>
  )
}
