// src/context/DocumentContext.jsx
// Shares document input and analysis results across all pages

/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState } from 'react';

const DocumentContext = createContext(null);

export function DocumentProvider({ children }) {
  // Input from LandingPage (file, image blob, or text string)
  const [documentInput, setDocumentInput] = useState(null);
  const [inputType, setInputType] = useState(null); // 'camera', 'upload', 'paste', 'demo'

  // Results from ProcessingPage (filled by useDocumentAnalysis hook)
  const [analysisResult, setAnalysisResult] = useState(null);
  const [drugInteractions, setDrugInteractions] = useState([]);

  // Check initial local storage state
  const [hasLastResult, setHasLastResult] = useState(() => {
    return !!localStorage.getItem('medlens:lastResult');
  });

  const saveLastResult = (resultData, interactions) => {
    try {
      const payload = {
        data: resultData,
        interactions: interactions || [],
        timestamp: Date.now()
      };
      localStorage.setItem('medlens:lastResult', JSON.stringify(payload));
      setHasLastResult(true);
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  };

  const loadLastResult = () => {
    try {
      const stored = localStorage.getItem('medlens:lastResult');
      if (stored) {
        const parsed = JSON.parse(stored);
        setAnalysisResult(parsed.data);
        setDrugInteractions(parsed.interactions);
        return true;
      }
    } catch (e) {
      console.error('Failed to parse from localStorage', e);
    }
    return false;
  };

  const clearLastResult = () => {
    localStorage.removeItem('medlens:lastResult');
    setHasLastResult(false);
  };

  const clearAll = () => {
    setDocumentInput(null);
    setInputType(null);
    setAnalysisResult(null);
    setDrugInteractions([]);
  };

  return (
    <DocumentContext.Provider value={{
      documentInput, setDocumentInput,
      inputType, setInputType,
      analysisResult, setAnalysisResult,
      drugInteractions, setDrugInteractions,
      clearAll,
      hasLastResult, saveLastResult, loadLastResult, clearLastResult
    }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocumentContext() {
  const ctx = useContext(DocumentContext);
  if (!ctx) throw new Error('useDocumentContext must be used within DocumentProvider');
  return ctx;
}