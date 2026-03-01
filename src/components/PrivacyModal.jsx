import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, EyeOff, SlidersHorizontal, AlertTriangle, Trash2 } from 'lucide-react';
import { useDocumentContext } from '../context/DocumentContext';

export default function PrivacyModal({ isOpen, onClose }) {
    const navigate = useNavigate();
    const { clearAll, clearLastResult } = useDocumentContext() || {};

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

    const handleClearSession = () => {
        if (clearAll) clearAll();
        if (clearLastResult) clearLastResult();
        onClose();
        navigate('/');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm"
                role="dialog"
                aria-modal="true"
                aria-labelledby="privacy-modal-title"
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
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                                <ShieldCheck size={24} />
                            </div>
                            <h2 id="privacy-modal-title" className="text-2xl font-bold text-gray-900">Privacy & Security</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-brand-500/50"
                            aria-label="Close privacy modal"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">

                        {/* Section 1: What we process */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
                                <ShieldCheck size={20} className="text-green-600" />
                                What we process
                            </h3>
                            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                                <p className="text-gray-700">We process the text from your document to generate a summary.</p>
                            </div>
                        </div>

                        {/* Section 2: What we don't do */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
                                <EyeOff size={20} className="text-gray-500" />
                                What we don't do
                            </h3>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <li className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-brand-500 mt-2 shrink-0"></div>
                                    <span className="text-gray-700">No login required.</span>
                                </li>
                                <li className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-brand-500 mt-2 shrink-0"></div>
                                    <span className="text-gray-700">We don't sell your data.</span>
                                </li>
                                <li className="sm:col-span-2 bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-brand-500 mt-2 shrink-0"></div>
                                    <span className="text-gray-700">We don't keep your uploaded images by default.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Section 3: Your control */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
                                <SlidersHorizontal size={20} className="text-brand-600" />
                                Your control
                            </h3>
                            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                                <p className="text-gray-700">You can clear results anytime.</p>
                            </div>
                        </div>

                        {/* Warning/Note */}
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                            <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-amber-800 text-sm">
                                Avoid uploading documents with sensitive identifiers if you don't need to.
                            </p>
                        </div>

                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3 justify-between items-center sticky bottom-0">
                        <button
                            type="button"
                            onClick={handleClearSession}
                            className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] text-red-700 font-bold bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-xl transition-colors focus:outline-none focus:ring-4 focus:ring-red-500/20 flex items-center justify-center gap-2"
                        >
                            <Trash2 size={18} />
                            Clear my session
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-8 py-2.5 min-h-[44px] bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-500/50 shadow-sm"
                        >
                            Got it
                        </button>
                    </div>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}