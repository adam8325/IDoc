import { useState } from 'react'
import Header from "../components/header"
import Intro from "../components/Intro"
import Output from "../components/output"
import Upload from "../components/upload"

export default function Home() {
  const [text, setText] = useState('')
  const [mode, setMode] = useState('user') // 'dev' eller 'user'
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState('')

  return (
    <div className="min-h-screen w-3/4 flex flex-col mx-auto border border-stone-100 rounded-sm ">
      <Header/>

      <main className='py-4 px-6 flex flex-col gap-4 bg-[linear-gradient(135deg,hsl(250_50%_96%),hsl(280_50%_98%))]'>
        <Intro/>
        <Upload text={text}
                setText={setText}
                loading={loading}
                setLoading={setLoading}
                mode={mode}
                setMode={setMode}
                setOutput={setOutput}
                />         
      
        <Output output={output} />
      </main>
      
    </div>
  )
}
