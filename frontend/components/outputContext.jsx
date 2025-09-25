import { createContext, useState, useContext } from 'react';

const OutputContext = createContext();

export function OutputProvider({ children }) {
  const [output, setOutput] = useState('');
  const [outputSource, setOutputSource] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  return (
    <OutputContext.Provider value=
    {{ output, setOutput, 
       outputSource, setOutputSource, 
       uploadedFileName, setUploadedFileName }}>
      {children}
    </OutputContext.Provider>
  );
}

export function useOutput() {
  return useContext(OutputContext);
}
