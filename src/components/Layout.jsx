import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PwaInstallPrompt from './PwaInstallPrompt';
import HelpModal from './HelpModal';
import PrivacyModal from './PrivacyModal';
import { Settings, Clock, X, Accessibility, Type, Contrast, Orbit, BookOpen, HelpCircle, ShieldCheck } from 'lucide-react';
import { useDocumentContext } from '../context/DocumentContext';

export default function Layout({ children, isCameraActive }) {
    const navigate = useNavigate();
    const { hasLastResult, loadLastResult, clearLastResult } = useDocumentContext() || {};
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    // Help Modal State
    const [helpOpen, setHelpOpen] = useState(false);

    // Privacy Modal State
    const [privacyOpen, setPrivacyOpen] = useState(false);

    // Accessibility Dropdown State
    const [a11yOpen, setA11yOpen] = useState(false);
    const a11yMenuRef = useRef(null);

    // Initializing state synchronously from localStorage to prevent flash
    const [a11yPrefs, setA11yPrefs] = useState(() => {
        const saved = localStorage.getItem('medlens-a11y');
        if (saved) return JSON.parse(saved);
        // Migrate old setting if exists
        const oldLargeText = localStorage.getItem('medlens-large-text') === 'true';
        return {
            largeText: oldLargeText,
            highContrast: false,
            reduceMotion: false,
            dyslexiaFont: false
        };
    });

    // Sync a11y preferences to body classes and localStorage
    useEffect(() => {
        const root = document.documentElement;

        // Large Text
        if (a11yPrefs.largeText) root.classList.add('a11y-text-lg');
        else root.classList.remove('a11y-text-lg');

        // High Contrast
        if (a11yPrefs.highContrast) root.classList.add('a11y-contrast');
        else root.classList.remove('a11y-contrast');

        // Reduce Motion
        if (a11yPrefs.reduceMotion) root.classList.add('a11y-reduce-motion');
        else root.classList.remove('a11y-reduce-motion');

        // Dyslexia Font
        if (a11yPrefs.dyslexiaFont) root.classList.add('a11y-dyslexia');
        else root.classList.remove('a11y-dyslexia');

        localStorage.setItem('medlens-a11y', JSON.stringify(a11yPrefs));
    }, [a11yPrefs]);

    // Handle click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (a11yMenuRef.current && !a11yMenuRef.current.contains(event.target)) {
                setA11yOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle Escape key closure
    useEffect(() => {
        function handleKeyDown(event) {
            if (event.key === 'Escape' && a11yOpen) {
                setA11yOpen(false);
            }
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [a11yOpen]);

    const toggleA11ySetting = (key) => {
        setA11yPrefs(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleLoadLast = () => {
        if (loadLastResult && loadLastResult()) {
            navigate('/results');
        }
    };

    const handleClearLast = () => {
        if (clearLastResult) clearLastResult();
        setShowClearConfirm(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-brand-100 transition-all duration-300">
            {!isCameraActive && (
                <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                    <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg p-1 -ml-1">
                            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">
                                M
                            </div>
                            <span className="text-xl font-bold tracking-tight text-gray-900">MedLens</span>
                        </Link>

                        {/* Accessibility Controls & History */}
                        <div className="flex items-center gap-2">
                            {/* Saved Result / History Control */}
                            {hasLastResult && (
                                <div className="relative flex items-center">
                                    <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm p-1 pr-2">
                                        <button
                                            onClick={handleLoadLast}
                                            title="View your most recent summary"
                                            className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
                                        >
                                            <Clock size={16} />
                                            <span className="hidden sm:inline">Last Result</span>
                                        </button>
                                        <div className="w-px h-4 bg-gray-200 mx-1"></div>
                                        <button
                                            onClick={() => setShowClearConfirm(!showClearConfirm)}
                                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                            aria-label="Clear last result"
                                            title="Clear last result"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>

                                    {/* Clear Confirmation Dropdown */}
                                    {showClearConfirm && (
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg p-3 z-50">
                                            <p className="text-sm font-medium text-gray-900 mb-2">Clear saved result?</p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setShowClearConfirm(false)}
                                                    className="flex-1 px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleClearLast}
                                                    className="flex-1 px-2 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                                >
                                                    Clear
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Help Modal Toggle */}
                            <button
                                onClick={() => setHelpOpen(true)}
                                aria-label="How MedLens works"
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                                title="Help & Info"
                            >
                                <HelpCircle size={16} className="text-gray-400" />
                                <span className="hidden lg:inline">Help</span>
                            </button>

                            {/* Privacy Modal Toggle */}
                            <button
                                onClick={() => setPrivacyOpen(true)}
                                aria-label="Privacy & Security"
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                                title="Privacy Info"
                            >
                                <ShieldCheck size={16} className="text-green-600" />
                                <span className="hidden lg:inline">Privacy</span>
                            </button>

                            {/* Accessibility Dropdown Toggle */}
                            <div className="relative" ref={a11yMenuRef}>
                                <button
                                    onClick={() => setA11yOpen(!a11yOpen)}
                                    aria-expanded={a11yOpen}
                                    aria-haspopup="menu"
                                    aria-controls="a11y-menu"
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${a11yOpen || Object.values(a11yPrefs).some(v => v)
                                        ? 'bg-brand-50 border-brand-200 text-brand-700'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    title="Accessibility Settings"
                                >
                                    <Accessibility size={16} className={(a11yOpen || Object.values(a11yPrefs).some(v => v)) ? 'text-brand-600' : 'text-gray-400'} />
                                    <span className="hidden sm:inline">Accessibility</span>
                                </button>

                                {/* Dropdown Menu */}
                                {a11yOpen && (
                                    <div
                                        id="a11y-menu"
                                        role="menu"
                                        aria-label="Accessibility Settings"
                                        className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-50 flex flex-col gap-1"
                                    >
                                        {[
                                            { key: 'largeText', label: 'Large Text', icon: Type, description: 'Increases all font sizes' },
                                            { key: 'highContrast', label: 'High Contrast', icon: Contrast, description: 'Enhances borders and colors' },
                                            { key: 'reduceMotion', label: 'Reduce Motion', icon: Orbit, description: 'Disables animations' },
                                            { key: 'dyslexiaFont', label: 'Dyslexia Font', icon: BookOpen, description: 'Improves reading clarity' },
                                        ].map((item) => {
                                            const isActive = a11yPrefs[item.key];
                                            return (
                                                <button
                                                    key={item.key}
                                                    role="menuitemcheckbox"
                                                    aria-checked={isActive}
                                                    onClick={() => toggleA11ySetting(item.key)}
                                                    className={`flex flex-col text-left px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${isActive ? 'bg-brand-50 hover:bg-brand-100' : 'hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between pointer-events-none">
                                                        <div className="flex items-center gap-2">
                                                            <item.icon size={16} className={isActive ? 'text-brand-600' : 'text-gray-500'} />
                                                            <span className={`text-sm font-medium ${isActive ? 'text-brand-900' : 'text-gray-700'}`}>
                                                                {item.label}
                                                            </span>
                                                        </div>
                                                        {/* Custom Checkbox Indicator */}
                                                        <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${isActive ? 'bg-brand-600' : 'bg-gray-200'}`}>
                                                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-gray-500 mt-1 pointer-events-none pl-6">{item.description}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>
            )}
            <main className={`${isCameraActive ? 'p-0' : 'max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in'}`}>
                {children}
            </main>

            {/* Global PWA Install Prompt & Modals */}
            {!isCameraActive && (
                <>
                    <PwaInstallPrompt />
                    <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
                    <PrivacyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
                </>
            )}
        </div>
    );
}