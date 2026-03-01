import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDocumentContext } from '../context/DocumentContext';
import { useDocumentAnalysis } from '../hooks/useDocumentAnalysis';

export default function ProcessingPage() {
    const navigate = useNavigate();
    const { documentInput, setAnalysisResult, setDrugInteractions } = useDocumentContext();
    const { analyzeDocument, result, interactions, loading, loadingStage, error } = useDocumentAnalysis();
    const [stage, setStage] = useState(0); // 0=ocr, 1=llm, 2=drugs, 3=done
    const hasStarted = useRef(false);

    // Redirect if no input
    useEffect(() => {
        if (!documentInput) {
            navigate('/');
        }
    }, [documentInput, navigate]);

    // Start analysis
    useEffect(() => {
        if (documentInput && !hasStarted.current) {
            hasStarted.current = true;
            analyzeDocument(documentInput);
        }
    }, [documentInput]);

    // Track loading stages for UI
    useEffect(() => {
        if (loadingStage.includes('Reading')) setStage(1);
        if (loadingStage.includes('medication') || loadingStage.includes('safety')) setStage(2);
    }, [loadingStage]);

    // When done, store results in context and navigate
    useEffect(() => {
        if (result && !loading) {
            setStage(3);
            setAnalysisResult(result);
            setDrugInteractions(interactions);
            // Brief delay so user sees the completed state
            const timer = setTimeout(() => navigate('/results'), 600);
            return () => clearTimeout(timer);
        }
    }, [result, loading, interactions, navigate, setAnalysisResult, setDrugInteractions]);

    // Handle errors
    useEffect(() => {
        if (error) {
            setStage(0);
        }
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full text-center bg-white p-8 rounded-3xl shadow-lg border border-gray-100"
            >
                {error ? (
                    <>
                        <div className="w-16 h-16 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                        <p className="text-gray-500 mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors"
                        >
                            Try again
                        </button>
                    </>
                ) : (
                    <>
                        <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
                            <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="46"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                    className="text-brand-500 transition-all duration-300 ease-out"
                                    strokeDasharray={289}
                                    strokeDashoffset={289 - (289 * (stage / 3) * 100) / 100}
                                />
                            </svg>
                            <div className="relative bg-brand-50 p-4 rounded-full text-brand-600">
                                <FileText size={32} />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {stage === 3 ? 'All done!' : 'Reading your document...'}
                        </h2>
                        <p className="text-gray-500 mb-8">
                            {stage === 3 ? 'Preparing your results.' : 'Our AI is translating medical terms into plain language.'}
                        </p>

                        <div className="flex flex-col gap-3 text-sm font-medium text-gray-500 text-left">
                            <div className="flex items-center gap-3">
                                {stage >= 1 ? <CheckCircleIcon /> : <Loader2 className="w-5 h-5 animate-spin text-brand-400" />}
                                <span className={stage >= 1 ? "text-gray-800" : ""}>Extracting text...</span>
                            </div>
                            <div className="flex items-center gap-3">
                                {stage >= 2 ? <CheckCircleIcon /> : stage >= 1 ? <Loader2 className="w-5 h-5 animate-spin text-brand-400" /> : <div className="w-5 h-5" />}
                                <span className={stage >= 2 ? "text-gray-800" : stage >= 1 ? "" : "opacity-40"}>Simplifying language...</span>
                            </div>
                            <div className="flex items-center gap-3">
                                {stage >= 3 ? <CheckCircleIcon /> : stage >= 2 ? <Loader2 className="w-5 h-5 animate-spin text-brand-400" /> : <div className="w-5 h-5" />}
                                <span className={stage >= 3 ? "text-gray-800" : stage >= 2 ? "" : "opacity-40"}>Checking drug interactions...</span>
                            </div>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}

function CheckCircleIcon() {
    return (
        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    );
}
