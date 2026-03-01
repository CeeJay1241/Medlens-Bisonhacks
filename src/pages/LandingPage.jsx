import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, FileUp, Type, X, FileText, CheckCircle2, ShieldAlert, ArrowRight, ShieldCheck, PlayCircle, Mic, MicOff } from 'lucide-react';
import CameraCapture from '../components/CameraCapture';
import Layout from '../components/Layout';
import { useDocumentContext } from '../context/DocumentContext';

export default function LandingPage() {
    const navigate = useNavigate();
    const { setDocumentInput, setInputType, clearAll } = useDocumentContext();
    const [activeModal, setActiveModal] = useState(null); // 'camera', 'upload', 'paste'
    const [pastedText, setPastedText] = useState('');
    const fileInputRef = useRef(null);

    // Clear previous results when landing page mounts
    useEffect(() => { clearAll(); }, []);

    // --- Demo sample text ---
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

    // --- Handlers ---
    const handleCameraCapture = (imageBlob) => {
        setDocumentInput(imageBlob);
        setInputType('camera');
        closeModal();
        navigate('/processing');
    };

    const handleFileUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setDocumentInput(file);
            setInputType('upload');
            navigate('/processing');
        }
    };

    const handlePasteSubmit = (e) => {
        e.preventDefault();
        if (pastedText.trim().length > 10) {
            setDocumentInput(pastedText.trim());
            setInputType('paste');
            closeModal();
            navigate('/processing');
        }
    };

    const handleTryDemo = () => {
        setDocumentInput(DEMO_TEXT);
        setInputType('demo');
        navigate('/processing');
    };

    // --- Voice Input ---
    const [isRecording, setIsRecording] = useState(false);
    const [voiceText, setVoiceText] = useState('');
    const recognitionRef = useRef(null);

    const startVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Speech recognition is not supported in this browser. Try Chrome.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let finalTranscript = '';

        recognition.onresult = (event) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript + ' ';
                } else {
                    interim += event.results[i][0].transcript;
                }
            }
            setVoiceText(finalTranscript + interim);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsRecording(false);
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
        setActiveModal('voice');
    };

    const stopVoiceInput = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsRecording(false);
    };

    const handleVoiceSubmit = () => {
        if (voiceText.trim().length > 10) {
            setDocumentInput(voiceText.trim());
            setInputType('voice');
            closeModal();
            navigate('/processing');
        }
    };

    const closeModal = () => {
        setActiveModal(null);
        setPastedText('');
        setVoiceText('');
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }
    };

    // Manage body scroll based on modal state
    useEffect(() => {
        if (activeModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [activeModal]);

    // --- Data ---
    const valueChips = [
        { icon: FileText, label: "Plain-language summary" },
        { icon: CheckCircle2, label: "Action items" },
        { icon: ShieldAlert, label: "Safety alerts" },
    ];

    const steps = [
        { num: 1, label: "Upload or scan" },
        { num: 2, label: "AI simplifies it" },
        { num: 3, label: "Read with confidence" },
    ];

    return (
        <Layout isCameraActive={activeModal === 'camera'}>
            <div className={`bg-gray-50 overflow-x-hidden ${activeModal === 'camera' ? 'min-h-[100dvh]' : 'min-h-screen pt-8 pb-20'}`}>
                {/* Hidden File Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,.pdf"
                    aria-label="Upload medical document"
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <main className="lg:grid lg:grid-cols-12 lg:gap-16 xl:gap-24 items-center">

                        {/* LEFT COLUMN: Hero Text & Input Cards */}
                        <div className="lg:col-span-6 xl:col-span-5 pt-8 lg:pt-0 pb-12 lg:pb-0 z-10">
                            {/* Eyebrow & Headline */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
                                    Medical documents, <br className="hidden sm:block" />
                                    <span className="text-brand-600">simplified instantly.</span>
                                </h1>
                                <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
                                    Snap a photo of your discharge papers, test results, or prescriptions to get a clear summary, next steps, and safety checks.
                                </p>
                            </motion.div>

                            {/* Value Chips */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                                className="flex flex-wrap gap-3 mb-10"
                            >
                                {valueChips.map((chip, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 px-3 py-1.5 rounded-full text-sm font-medium">
                                        <chip.icon size={16} className="text-brand-500" />
                                        {chip.label}
                                    </div>
                                ))}
                            </motion.div>

                            {/* Interactive Cards */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                                className="space-y-4 mb-8"
                            >
                                {/* Card 1: Camera */}
                                <button
                                    onClick={() => setActiveModal('camera')}
                                    className="w-full group hover-lift relative bg-white border border-gray-200 rounded-2xl p-5 hover:border-brand-500 transition-all text-left focus:outline-none focus:ring-4 focus:ring-brand-500/50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                                            <Camera size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">Scan with camera</h3>
                                            <p className="text-sm text-gray-500 line-clamp-1">Take a clear photo of your document</p>
                                        </div>
                                        <ArrowRight size={20} className="text-gray-300 group-hover:text-brand-500 transition-colors transform group-hover:translate-x-1" />
                                    </div>
                                </button>

                                {/* Card 2: Upload */}
                                <button
                                    onClick={handleFileUploadClick}
                                    className="w-full group hover-lift relative bg-white border border-gray-200 rounded-2xl p-5 hover:border-brand-500 transition-all text-left focus:outline-none focus:ring-4 focus:ring-brand-500/50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-colors">
                                            <FileUp size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">Upload file</h3>
                                            <p className="text-sm text-gray-500 line-clamp-1">PDFs or images (drag & drop support)</p>
                                        </div>
                                        <ArrowRight size={20} className="text-gray-300 group-hover:text-violet-500 transition-colors transform group-hover:translate-x-1" />
                                    </div>
                                </button>

                                {/* Card 3: Paste */}
                                <button
                                    onClick={() => setActiveModal('paste')}
                                    className="w-full group hover-lift relative bg-white border border-gray-200 rounded-2xl p-5 hover:border-brand-500 transition-all text-left focus:outline-none focus:ring-4 focus:ring-brand-500/50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                            <Type size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">Paste text</h3>
                                            <p className="text-sm text-gray-500 line-clamp-1">Copy and paste text from your portal</p>
                                        </div>
                                        <ArrowRight size={20} className="text-gray-300 group-hover:text-emerald-500 transition-colors transform group-hover:translate-x-1" />
                                    </div>
                                </button>

                                {/* Card 4: Voice */}
                                <button
                                    onClick={startVoiceInput}
                                    className="w-full group hover-lift relative bg-white border border-gray-200 rounded-2xl p-5 hover:border-brand-500 transition-all text-left focus:outline-none focus:ring-4 focus:ring-brand-500/50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                                            <Mic size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">Speak it</h3>
                                            <p className="text-sm text-gray-500 line-clamp-1">Read your document aloud or describe it</p>
                                        </div>
                                        <ArrowRight size={20} className="text-gray-300 group-hover:text-rose-500 transition-colors transform group-hover:translate-x-1" />
                                    </div>
                                </button>
                            </motion.div>

                            {/* Privacy & Demo */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-t border-gray-200"
                            >
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <ShieldCheck size={16} className="text-green-600 shrink-0" />
                                    <span>We only use your text to generate results.</span>
                                </div>

                                <button
                                    onClick={handleTryDemo}
                                    className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-800 transition-colors group"
                                >
                                    <PlayCircle size={18} className="group-hover:scale-110 transition-transform" />
                                    Try sample demo
                                </button>
                            </motion.div>

                            {/* Stepper (Desktop logic flow view) */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
                                className="mt-10 hidden sm:flex items-center justify-between relative max-w-sm"
                            >
                                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -z-10 -translate-y-1/2 rounded-full"></div>
                                {steps.map((step, idx) => (
                                    <div key={idx} className="flex flex-col items-center bg-gray-50 px-2">
                                        <div className="w-8 h-8 rounded-full bg-white border-2 border-brand-500 text-brand-600 text-sm font-bold flex items-center justify-center shadow-sm mb-2">
                                            {step.num}
                                        </div>
                                        <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">{step.label}</span>
                                    </div>
                                ))}
                            </motion.div>

                        </div>

                        {/* RIGHT COLUMN: Medical Illustration Placeholder */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
                            className="lg:col-span-6 xl:col-span-7 hidden lg:block"
                        >
                            {/* SVG Illustration Placeholder that fits the theme */}
                            <div className="relative w-full aspect-square max-w-[600px] ml-auto">
                                {/* Abstract Medical Theme Blob Backgrounds */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-brand-100 to-violet-50 rounded-[3rem] transform rotate-3 scale-105 opacity-70"></div>
                                <div className="absolute inset-0 bg-white shadow-xl shadow-brand-900/5 rounded-[3rem] overflow-hidden border border-gray-100 flex items-center justify-center p-12">

                                    <svg viewBox="0 0 400 400" className="w-full h-full text-brand-500" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        {/* Stylized Document */}
                                        <rect x="100" y="60" width="200" height="280" rx="16" fill="white" stroke="currentColor" strokeWidth="8" />
                                        <path d="M140 120H260" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                                        <path d="M140 160H220" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />

                                        {/* Stylized Checkmarks / Badges popping out */}
                                        <circle cx="280" cy="180" r="40" fill="#E0E7FF" stroke="currentColor" strokeWidth="8" />
                                        <path d="M265 180L275 190L295 170" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />

                                        <circle cx="120" cy="240" r="30" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="8" />
                                        <path d="M120 225V245M120 255H120.01" stroke="#F59E0B" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />

                                        {/* Sparkles / Scanning line */}
                                        <line x1="60" y1="140" x2="340" y2="140" stroke="#3B82F6" strokeWidth="4" strokeDasharray="8 8" className="opacity-50" />

                                        <path d="M160 210H260" stroke="#93C5FD" strokeWidth="8" strokeLinecap="round" />
                                        <path d="M160 250H240" stroke="#93C5FD" strokeWidth="8" strokeLinecap="round" />
                                        <path d="M160 290H200" stroke="#93C5FD" strokeWidth="8" strokeLinecap="round" />
                                    </svg>

                                    {/* Floating decorative UI blocks */}
                                    <div className="absolute top-10 left-8 bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3 animate-pulse">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><FileText size={16} className="text-blue-600" /></div>
                                        <div className="h-2 w-16 bg-gray-200 rounded-full"></div>
                                    </div>
                                    <div className="absolute bottom-20 right-8 bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3" style={{ animation: 'pulse 3s infinite reverse' }}>
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle2 size={16} className="text-green-600" /></div>
                                        <div className="h-2 w-12 bg-gray-200 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </main>
                </div>

                {/* Modals */}
                <AnimatePresence>
                    {/* 1. Camera Modal */}
                    {activeModal === 'camera' && (
                        <CameraCapture
                            onCapture={handleCameraCapture}
                            onClose={closeModal}
                        />
                    )}

                    {/* 2. Paste Text Modal */}
                    {activeModal === 'paste' && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
                            role="dialog" aria-modal="true" aria-labelledby="paste-modal-title"
                        >
                            <motion.div
                                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                                className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                                style={{ maxHeight: 'calc(100vh - 2rem)' }} // Account for padding
                            >
                                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                            <Type size={20} />
                                        </div>
                                        <h2 id="paste-modal-title" className="text-xl font-bold text-gray-900">Paste document text</h2>
                                    </div>
                                    <button
                                        onClick={closeModal}
                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-gray-200"
                                        aria-label="Close modal"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handlePasteSubmit} className="flex flex-col flex-1 p-6 overflow-hidden">
                                    <p className="text-gray-600 mb-4 text-sm">
                                        Copy text from your patient portal, chart, or digital records and paste it below. Don't worry about formatting.
                                    </p>
                                    <textarea
                                        value={pastedText}
                                        onChange={(e) => setPastedText(e.target.value)}
                                        placeholder="Paste medical text here..."
                                        className="w-full h-48 sm:h-64 flex-1 p-4 border border-gray-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 resize-none text-gray-700 text-lg leading-relaxed placeholder:text-gray-400"
                                        aria-label="Text to simplify"
                                    />
                                    <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-6 py-3 min-h-[48px] text-gray-700 font-bold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors focus:ring-4 focus:ring-gray-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={pastedText.trim().length < 10}
                                            className="px-8 py-3 min-h-[48px] bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:ring-4 focus:ring-brand-500/50 shadow-md flex justify-center items-center"
                                        >
                                            Simplify text
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* 3. Voice Input Modal */}
                    {activeModal === 'voice' && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
                            role="dialog" aria-modal="true" aria-labelledby="voice-modal-title"
                        >
                            <motion.div
                                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                                className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                                style={{ maxHeight: 'calc(100vh - 2rem)' }}
                            >
                                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isRecording ? 'bg-red-50 text-red-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                                        </div>
                                        <h2 id="voice-modal-title" className="text-xl font-bold text-gray-900">
                                            {isRecording ? 'Listening...' : 'Voice input'}
                                        </h2>
                                    </div>
                                    <button
                                        onClick={closeModal}
                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-gray-200"
                                        aria-label="Close modal"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="flex flex-col flex-1 p-6 overflow-hidden">
                                    <p className="text-gray-600 mb-4 text-sm">
                                        Read your medical document aloud or describe your medical information. We'll transcribe and simplify it.
                                    </p>

                                    {/* Recording indicator */}
                                    {isRecording && (
                                        <div className="flex items-center gap-3 mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                            <span className="text-red-700 text-sm font-medium">Recording — speak clearly</span>
                                        </div>
                                    )}

                                    {/* Transcribed text */}
                                    <div className="w-full h-48 sm:h-64 flex-1 p-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 text-lg leading-relaxed overflow-y-auto mb-6">
                                        {voiceText || <span className="text-gray-400 italic">{isRecording ? 'Speak now...' : 'Press the button below to start recording'}</span>}
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                                        <button
                                            onClick={isRecording ? stopVoiceInput : startVoiceInput}
                                            className={`flex items-center gap-2 px-6 py-3 min-h-[48px] font-bold rounded-xl transition-colors focus:ring-4 ${isRecording
                                                ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-200'
                                                }`}
                                        >
                                            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                                            {isRecording ? 'Stop recording' : 'Start recording'}
                                        </button>

                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={closeModal}
                                                className="px-6 py-3 min-h-[48px] text-gray-700 font-bold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors focus:ring-4 focus:ring-gray-200"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleVoiceSubmit}
                                                disabled={voiceText.trim().length < 10}
                                                className="px-8 py-3 min-h-[48px] bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:ring-4 focus:ring-brand-500/50 shadow-md"
                                            >
                                                Simplify text
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Layout>
    );
}
