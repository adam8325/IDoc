import { useState } from 'react'
import { OutputProvider } from "../components/outputContext";
import Header from "../components/header"
import Intro from "../components/intro"
import Output from "../components/output"
import Upload from "../components/upload"
import HelpModal from "../components/helpModal"


// #TODO: Consider moving state to specific components

export default function Home() {
  const [text, setText] = useState('')
  const [mode, setMode] = useState('dev') // 'dev' eller 'user'
  const [output, setOutput] = useState('')


  return (
    <OutputProvider>
      <div className="min-h-screen w-3/4 flex flex-col mx-auto border border-stone-100 rounded-sm ">
        <Header/>
        <main className='py-4 px-6 flex flex-col gap-4 bg-[linear-gradient(135deg,hsl(250_50%_96%),hsl(280_50%_98%))]'>
          <div className="flex items-start justify-between py-4">
            <div className="flex-1 flex justify-center">
              <Intro />
            </div>
            <HelpModal /> 
          </div>
          <Upload text={text}
                  setText={setText}
                  mode={mode}
                  setMode={setMode}
                  setOutput={setOutput}
                  />         
        
          <Output output={output} />
        </main>      
      </div>
    </OutputProvider>
  )
}
