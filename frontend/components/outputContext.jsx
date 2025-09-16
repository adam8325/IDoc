import { createContext, useState, useContext } from 'react';

const OutputContext = createContext();

export function OutputProvider({ children }) {
  const [output, setOutput] = useState('');
  const [outputSource, setOutputSource] = useState('');

  return (
    <OutputContext.Provider value={{ output, setOutput, outputSource, setOutputSource }}>
      {children}
    </OutputContext.Provider>
  );
}

export function useOutput() {
  return useContext(OutputContext);
}
