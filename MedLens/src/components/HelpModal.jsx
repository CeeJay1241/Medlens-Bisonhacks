import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileUp, ScanText, Sparkles, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';
import { useDocumentContext } from '../context/DocumentContext';

const DEMO_TEXT = `DISCHARGE SUMMARY
Patient: John Doe, DOB: 03/15/1965
Date of Discharge: 02/21/2026
Diagnosis: Type 2 Diabetes Mellitus, Hypertension

Medications:
- Metformin 500mg PO BID with meals
- Lisinopril 10mg PO daily
- Aspirin 81mg PO daily

Instructions:
- Monitor blood glucose levels daily before breakfast
- Follow up with Dr. Williams in 2 weeks
- Low sodium diet recommended
- Return to ER if experiencing chest pain, severe headache, or blood glucose >400mg/dL

Follow-up: Dr. Williams, March 7, 2026 at 10:00 AM`;

export default function HelpModal({ isOpen, onClose }) {
    const navigate = useNavigate();
    const { setDocumentInput, setInputType } = useDocumentContext() || {};

    // Handle Escape key closure
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Trap focus and manage body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    const handleTryDemo = () => {
        if (setDocumentInput && setInputType) {
            setDocumentInput(DEMO_TEXT);
            setInputType('demo');
            onClose();
            navigate('/processing');
        }
    };

    if (!isOpen) return null;

    const steps = [
        { icon: FileUp, label: "Upload / Scan", desc: "Take a photo or upload a file" },
        { icon: ScanText, label: "We extract text", desc: "Optical Character Recognition (OCR)" },
        { icon: Sparkles, label: "AI simplifies it", desc: "Matched to your strict reading level" },
        { icon: CheckCircle2, label: "You review results", desc: "Summary, action items, & safety alerts" },
    ];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm"
                role="dialog"
                aria-modal="true"
                aria-labelledby="help-modal-title"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col relative"
                    style={{ maxHeight: 'calc(100vh - 2rem)' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                        <h2 id="help-modal-title" className="text-2xl font-bold text-gray-900">How MedLens works</h2>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-brand-500/50"
                            aria-label="Close help modal"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">

                        {/* 4 Steps */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {steps.map((step, idx) => (
                                <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 items-start">
                                    <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                                        <step.icon size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">
                                            <span className="text-brand-600 mr-2">{idx + 1}.</span>
                                            {step.label}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Tips */}
                        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5">
                            <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-3">
                                <Lightbulb size={20} className="text-blue-600" />
                                Tips for best results
                            </h4>
                            <ul className="list-disc pl-5 space-y-2 text-blue-800 text-sm">
                                <li>Ensure <span className="font-semibold">good lighting</span> so text is highly legible</li>
                                <li>Capture the <span className="font-semibold">full page</span> including standard headers</li>
                                <li>Avoid <span className="font-semibold">glare</span> or blurry camera focus</li>
                            </ul>
                        </div>

                        {/* Disclaimer */}
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4">
                            <AlertTriangle size={24} className="text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-amber-900 mb-1">Medical Disclaimer</h4>
                                <p className="text-amber-800 text-sm leading-relaxed">
                                    MedLens is not medical advice. If symptoms feel urgent, call emergency services or contact a clinician immediately. Always verify AI-generated summaries with a medical professional.
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3 justify-end items-center sticky bottom-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-6 py-2.5 min-h-[44px] text-gray-700 font-bold bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors focus:outline-none focus:ring-4 focus:ring-brand-500/50"
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            onClick={handleTryDemo}
                            className="w-full sm:w-auto px-6 py-2.5 min-h-[44px] bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors focus:outline-none focus:ring-4 focus:ring-brand-500/50 shadow-sm"
                        >
                            Try Demo
                        </button>
                    </div>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}