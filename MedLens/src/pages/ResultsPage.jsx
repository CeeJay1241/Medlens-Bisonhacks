import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, Download, AlertTriangle, CheckSquare, FileText, ChevronDown, Pill, Globe, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useDocumentContext } from '../context/DocumentContext';
import { analyzeMedicalDocument } from '../services/medlens-ai.js';
import { useReactToPrint } from 'react-to-print';

export default function ResultsPage() {
    const navigate = useNavigate();
    const { analysisResult: data, setAnalysisResult, drugInteractions, saveLastResult } = useDocumentContext();
    const [activeTab, setActiveTab] = useState('summary');
    const [readingLevel, setReadingLevel] = useState('simple');
    const [language, setLanguage] = useState('English');
    const [isPlaying, setIsPlaying] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    // UI translations for headings
    const uiText = {
        English: { summary: 'Summary', actions: 'Action Items', alerts: 'Alerts', docSummary: 'Document Summary', schedule: 'Schedule', nextSteps: 'Your Next Steps', safetyChecks: 'Safety Checks', diagnoses: 'Diagnoses', medications: 'Medications Found', dates: 'Important Dates', warning: 'Warning', noWarnings: 'No Critical Warnings', noWarningsDesc: 'No immediate red flags were found in this document.', listen: 'Listen', stop: 'Stop', dailySchedule: 'Daily Medication Schedule', scheduleDesc: 'Your medications organized by time of day.', drugAlerts: 'Drug Interaction Alerts', simple: 'Simple (5th Grade)', standard: 'Standard (8th Grade)', detailed: 'Detailed (12th Grade)', morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', bedtime: 'Bedtime', noMeds: 'No medications', noSchedule: 'No medication schedule available for this document.' },
        Spanish: { summary: 'Resumen', actions: 'Pasos a seguir', alerts: 'Alertas', docSummary: 'Resumen del documento', schedule: 'Horario', nextSteps: 'Sus próximos pasos', safetyChecks: 'Controles de seguridad', diagnoses: 'Diagnósticos', medications: 'Medicamentos encontrados', dates: 'Fechas importantes', warning: 'Advertencia', noWarnings: 'Sin advertencias críticas', noWarningsDesc: 'No se encontraron señales de alerta en este documento.', listen: 'Escuchar', stop: 'Parar', dailySchedule: 'Horario diario de medicamentos', scheduleDesc: 'Sus medicamentos organizados por hora del día.', drugAlerts: 'Alertas de interacción de medicamentos', simple: 'Simple (5° grado)', standard: 'Estándar (8° grado)', detailed: 'Detallado (12° grado)', morning: 'Mañana', afternoon: 'Tarde', evening: 'Noche', bedtime: 'Antes de dormir', noMeds: 'Sin medicamentos', noSchedule: 'No hay horario de medicamentos disponible para este documento.' },
        French: { summary: 'Résumé', actions: 'Actions à faire', alerts: 'Alertes', docSummary: 'Résumé du document', schedule: 'Horaire', nextSteps: 'Vos prochaines étapes', safetyChecks: 'Vérifications de sécurité', diagnoses: 'Diagnostics', medications: 'Médicaments trouvés', dates: 'Dates importantes', warning: 'Avertissement', noWarnings: 'Aucun avertissement critique', noWarningsDesc: 'Aucun signal d\'alerte trouvé dans ce document.', listen: 'Écouter', stop: 'Arrêter', dailySchedule: 'Horaire quotidien des médicaments', scheduleDesc: 'Vos médicaments organisés par moment de la journée.', drugAlerts: 'Alertes d\'interaction médicamenteuse', simple: 'Simple (5e année)', standard: 'Standard (8e année)', detailed: 'Détaillé (12e année)', morning: 'Matin', afternoon: 'Après-midi', evening: 'Soir', bedtime: 'Coucher', noMeds: 'Aucun médicament', noSchedule: 'Aucun horaire de médicaments disponible pour ce document.' },
        Chinese: { summary: '摘要', actions: '待办事项', alerts: '警报', docSummary: '文件摘要', schedule: '时间表', nextSteps: '您的下一步', safetyChecks: '安全检查', diagnoses: '诊断', medications: '发现的药物', dates: '重要日期', warning: '警告', noWarnings: '无严重警告', noWarningsDesc: '本文件未发现紧急警示。', listen: '收听', stop: '停止', dailySchedule: '每日用药时间表', scheduleDesc: '按时间段整理的药物。', drugAlerts: '药物相互作用警报', simple: '简单（小学）', standard: '标准（初中）', detailed: '详细（高中）', morning: '早上', afternoon: '下午', evening: '傍晚', bedtime: '睡前', noMeds: '无药物', noSchedule: '此文件无可用的药物时间表。' },
        Korean: { summary: '요약', actions: '할 일', alerts: '경고', docSummary: '문서 요약', schedule: '일정', nextSteps: '다음 단계', safetyChecks: '안전 점검', diagnoses: '진단', medications: '발견된 약물', dates: '중요한 날짜', warning: '경고', noWarnings: '심각한 경고 없음', noWarningsDesc: '이 문서에서 위험 신호가 발견되지 않았습니다.', listen: '듣기', stop: '중지', dailySchedule: '일일 복약 일정', scheduleDesc: '시간대별로 정리된 약물.', drugAlerts: '약물 상호작용 경고', simple: '간단 (초등)', standard: '표준 (중등)', detailed: '상세 (고등)', morning: '아침', afternoon: '오후', evening: '저녁', bedtime: '취침 전', noMeds: '약물 없음', noSchedule: '이 문서에 대한 복약 일정이 없습니다.' },
        Vietnamese: { summary: 'Tóm tắt', actions: 'Việc cần làm', alerts: 'Cảnh báo', docSummary: 'Tóm tắt tài liệu', schedule: 'Lịch trình', nextSteps: 'Bước tiếp theo', safetyChecks: 'Kiểm tra an toàn', diagnoses: 'Chẩn đoán', medications: 'Thuốc tìm thấy', dates: 'Ngày quan trọng', warning: 'Cảnh báo', noWarnings: 'Không có cảnh báo nghiêm trọng', noWarningsDesc: 'Không tìm thấy dấu hiệu nguy hiểm trong tài liệu này.', listen: 'Nghe', stop: 'Dừng', dailySchedule: 'Lịch uống thuốc hàng ngày', scheduleDesc: 'Thuốc được sắp xếp theo thời gian trong ngày.', drugAlerts: 'Cảnh báo tương tác thuốc', simple: 'Đơn giản (Lớp 5)', standard: 'Tiêu chuẩn (Lớp 8)', detailed: 'Chi tiết (Lớp 12)', morning: 'Sáng', afternoon: 'Chiều', evening: 'Tối', bedtime: 'Trước khi ngủ', noMeds: 'Không có thuốc', noSchedule: 'Không có lịch uống thuốc cho tài liệu này.' },
    };
    const t = uiText[language] || uiText.English;

    // Reference for the PDF print area
    const contentRef = useRef(null);

    // Redirect if no data, otherwise auto-save to localStorage
    useEffect(() => {
        if (!data) {
            navigate('/');
        } else {
            saveLastResult(data, drugInteractions);
        }
    }, [data, drugInteractions, navigate, saveLastResult]);

    if (!data) return null;

    const warningCount = (data.warnings?.length || 0) + (drugInteractions?.length || 0);

    const tabs = [
        { id: 'summary', label: t.summary, icon: FileText },
        { id: 'schedule', label: t.schedule, icon: Pill },
        { id: 'actions', label: t.actions, icon: CheckSquare },
        { id: 'alerts', label: `${t.alerts} (${warningCount})`, icon: AlertTriangle },
    ];

    const handleLevelChange = (e) => setReadingLevel(e.target.value);

    const handleLanguageChange = async (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        if (newLang !== language && data?.rawText) {
            setTranslating(true);
            try {
                const newResult = await analyzeMedicalDocument(data.rawText, newLang);
                if (!newResult.error) {
                    setAnalysisResult(newResult);
                }
            } catch (err) {
                console.error('Translation failed:', err);
            }
            setTranslating(false);
        }
    };

    const activeUtteranceRef = useRef(null);

    const playUtterance = (forceRestart = false) => {
        if (isPlaying && !forceRestart) {
            // Explicitly stopping
            if (activeUtteranceRef.current) {
                // Remove listeners so the cancel doesn't trigger onend and mess up state
                activeUtteranceRef.current.onend = null;
                activeUtteranceRef.current.onerror = null;
            }
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            return;
        }

        // Before starting a new one, cleanly cancel any existing ones
        if (activeUtteranceRef.current) {
            activeUtteranceRef.current.onend = null;
            activeUtteranceRef.current.onerror = null;
        }
        window.speechSynthesis.cancel();

        let textToRead = "";
        if (activeTab === 'summary') {
            textToRead = typeof data.summary === 'object' ? (data.summary[readingLevel] || data.summary.simple) : data.summary;
        } else if (activeTab === 'actions') {
            textToRead = "Your Next Steps. " + (data.action_items || []).map((item, i) => `${i + 1}: ${item}`).join(". ");
        } else if (activeTab === 'alerts') {
            textToRead = "Safety Checks and Warnings. " + (data.warnings || []).join(". ");
        }

        const utterance = new SpeechSynthesisUtterance(textToRead);
        activeUtteranceRef.current = utterance; // Track it

        const voices = window.speechSynthesis.getVoices();
        const feminineVoice = voices.find(voice =>
            voice.name.includes('Zira') ||
            voice.name.includes('Samantha') ||
            voice.name.includes('Google US English') ||
            voice.name.includes('Susan') ||
            (voice.name.includes('Female') && voice.lang.startsWith('en'))
        );

        if (feminineVoice) {
            utterance.voice = feminineVoice;
        } else {
            const englishVoice = voices.find(v => v.lang.startsWith('en'));
            if (englishVoice) utterance.voice = englishVoice;
        }

        utterance.pitch = 1.1;
        utterance.rate = playbackSpeed;

        utterance.onend = () => {
            setIsPlaying(false);
            activeUtteranceRef.current = null;
        };
        utterance.onerror = (e) => {
            console.error("Speech synthesis error", e);
            setIsPlaying(false);
            activeUtteranceRef.current = null;
        };

        setIsPlaying(true);
        // Slight timeout helps some browsers clear the cancel queue before speaking
        setTimeout(() => {
            window.speechSynthesis.speak(utterance);
        }, 50);
    };

    const handleReadAloud = () => playUtterance(false);

    // Watch for speed changes specifically mid-playback
    useEffect(() => {
        if (isPlaying) {
            playUtterance(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playbackSpeed]);

    if (typeof window !== 'undefined' && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }

    const handleDownloadPdf = useReactToPrint({
        contentRef,
        documentTitle: 'MedLens_Summary',
    });

    return (
        <Layout>
            <div className="w-full pb-20">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigate('/')}
                        className="p-3 -ml-3 text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-brand-500 rounded-xl transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
                        aria-label="Go back"
                        title="Go back to the previous page"
                    >
                        <ArrowLeft size={24} />
                    </button>

                    <div className="flex flex-wrap justify-end gap-2">
                        {/* Playback Speed Selector */}
                        <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm h-[48px]" role="group" aria-label="Playback speed">
                            {[0.75, 1, 1.25, 1.5].map((speed) => (
                                <button
                                    key={speed}
                                    onClick={() => setPlaybackSpeed(speed)}
                                    className={`px-2 sm:px-3 h-full text-xs font-bold rounded-lg transition-colors ${playbackSpeed === speed ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                                    aria-pressed={playbackSpeed === speed}
                                >
                                    {speed}x
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleReadAloud}
                            className={`flex items-center justify-center gap-2 px-4 py-2 min-h-[48px] text-sm font-bold rounded-xl transition-colors focus:ring-4 focus:ring-brand-500/50 ${isPlaying ? 'bg-brand-600 text-white shadow-md' : 'text-brand-700 bg-brand-50 hover:bg-brand-100'}`}
                            aria-label={isPlaying ? "Stop reading aloud" : "Read summary aloud"}
                            aria-pressed={isPlaying}
                            title={isPlaying ? "Stop reading" : "Listen to the summary"}
                        >
                            <Volume2 size={20} className={isPlaying ? "animate-pulse" : ""} />
                            <span className="hidden sm:inline">{isPlaying ? t.stop : t.listen}</span>
                        </button>
                        <button
                            className="flex items-center justify-center gap-2 px-4 py-2 min-h-[48px] text-sm font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors focus:ring-4 focus:ring-gray-500/50"
                            aria-label="Download PDF"
                            title="Download a PDF copy of this summary"
                            onClick={handleDownloadPdf}
                        >
                            <Download size={20} />
                        </button>
                    </div>
                </div>

                {/* OCR Warning */}
                {data.ocrWarning && (
                    <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 items-start">
                        <AlertTriangle size={20} className="text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-amber-800 text-sm">{data.ocrWarning}</p>
                    </div>
                )}

                {/* Language selector */}
                <div className="flex items-center gap-2 mb-6">
                    <Globe size={16} className="text-gray-400" />
                    <select
                        value={language}
                        onChange={handleLanguageChange}
                        disabled={translating}
                        className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-4 focus:ring-brand-500/50 focus:border-brand-500 p-2 pr-8 min-h-[40px] disabled:opacity-50"
                        aria-label="Select language"
                    >
                        <option value="English">English</option>
                        <option value="Spanish">Español</option>
                        <option value="French">Français</option>
                        <option value="Chinese">中文</option>
                        <option value="Korean">한국어</option>
                        <option value="Vietnamese">Tiếng Việt</option>
                    </select>
                    {translating && (
                        <div className="flex items-center gap-2 text-sm text-brand-600">
                            <Loader2 size={16} className="animate-spin" />
                            <span>Translating...</span>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div
                    ref={contentRef}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6"
                    id="pdf-content-area"
                    style={{ "@media print": { margin: 0, border: 'none', boxShadow: 'none' } }}
                >
                    <div className="flex border-b border-gray-200" role="tablist">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                role="tab"
                                aria-selected={activeTab === tab.id}
                                aria-controls={`panel-${tab.id}`}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-4 px-2 text-center text-sm font-medium transition-colors relative focus:outline-none min-h-[48px] ${activeTab === tab.id ? 'text-brand-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 focus:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <tab.icon size={18} className={tab.id === 'alerts' && activeTab !== 'alerts' ? 'text-amber-500' : ''} />
                                    <span className="hidden xs:inline sm:inline">{tab.label}</span>
                                </div>
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-1 bg-brand-600 rounded-t-full"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                id={`panel-${activeTab}`}
                                role="tabpanel"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'summary' && (
                                    <SummaryTab data={data} readingLevel={readingLevel} onLevelChange={handleLevelChange} t={t} />
                                )}
                                {activeTab === 'schedule' && <ScheduleTab data={data} t={t} />}
                                {activeTab === 'actions' && <ActionsTab data={data} t={t} />}
                                {activeTab === 'alerts' && <AlertsTab data={data} drugInteractions={drugInteractions} t={t} />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

function SummaryTab({ data, readingLevel, onLevelChange, t }) {
    // Handle summary as object {simple, standard, detailed} or as a plain string
    const summaryText = typeof data.summary === 'object'
        ? (data.summary[readingLevel] || data.summary.simple || '')
        : (data.summary || '');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-xl font-bold text-gray-900">{t.docSummary}</h3>
                <div className="relative">
                    <select
                        value={readingLevel}
                        onChange={onLevelChange}
                        className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-4 focus:ring-brand-500/50 focus:border-brand-500 block w-full p-2.5 pr-8 min-h-[48px]"
                        aria-label="Select reading level"
                    >
                        <option value="simple">{t.simple}</option>
                        <option value="standard">{t.standard}</option>
                        <option value="detailed">{t.detailed}</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-3.5 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
            </div>

            <div className="prose prose-brand max-w-none text-gray-700" aria-live="polite">
                <p className="text-lg leading-relaxed mb-4">
                    {summaryText}
                </p>

                {data.diagnoses && data.diagnoses.length > 0 && (
                    <div className="mt-6 p-4 bg-brand-50 rounded-xl border border-brand-100">
                        <h4 className="font-bold text-brand-900 mb-2">{t.diagnoses}</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            {data.diagnoses.map((diag, i) => (
                                <li key={i} className="text-brand-800">
                                    <span className="font-semibold">{diag.name}:</span> {diag.plain_language}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Disclaimer */}
            {data.disclaimer && (
                <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 italic">{data.disclaimer}</p>
                </div>
            )}
        </div>
    );
}

function ActionsTab({ data, t }) {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">{t.nextSteps}</h3>

            <ul className="space-y-3">
                {data.action_items.map((item, i) => (
                    <li key={i} className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-brand-300 hover-lift transition-colors cursor-pointer">
                        <div className="mt-1 flex items-center min-h-[24px]">
                            <input type="checkbox" className="w-6 h-6 rounded border-gray-300 text-brand-600 focus:ring-4 focus:ring-brand-500/50" aria-label={`Mark as done: ${item}`} />
                        </div>
                        <span className="text-gray-800 text-lg leading-snug">{item}</span>
                    </li>
                ))}
            </ul>

            {data.dates && data.dates.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-3">{t.dates}</h4>
                    <div className="space-y-2">
                        {data.dates.map((dateObj, i) => (
                            <div key={i} className="flex justify-between p-3 bg-white border border-gray-200 rounded-lg hover-lift">
                                <span className="font-medium text-gray-700">{dateObj.event}</span>
                                <span className="text-brand-600 font-bold">{dateObj.date}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function AlertsTab({ data, drugInteractions = [], t }) {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">{t.safetyChecks}</h3>

            {/* Drug Interaction Warnings */}
            {drugInteractions.length > 0 && (
                <div className="space-y-3">
                    <h4 className="font-bold text-red-900 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-red-500" />
                        {t.drugAlerts}
                    </h4>
                    {drugInteractions.map((item, i) => (
                        <div key={i} className="p-5 bg-red-50 border border-red-200 rounded-xl relative overflow-hidden hover-lift mb-2">
                            <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
                            <div className="flex gap-4 pl-2">
                                <div>
                                    <h5 className="text-lg font-bold text-red-900 mb-1">{item.drug}</h5>
                                    <p className="text-red-800 text-sm">{item.details}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* General Warnings */}
            {data.warnings && data.warnings.length > 0 ? (
                data.warnings.map((warning, i) => (
                    <div key={i} className="p-5 bg-amber-50 border border-amber-200 rounded-xl relative overflow-hidden mb-4 hover-lift">
                        <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>
                        <div className="flex gap-4">
                            <div className="text-amber-500 mt-1">
                                <AlertTriangle size={24} aria-hidden="true" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-amber-900 mb-1">{t.warning}</h4>
                                <p className="text-amber-800 text-base">{warning}</p>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="p-5 bg-green-50 border border-green-200 rounded-xl flex gap-4">
                    <div className="text-green-500 mt-1">
                        <CheckSquare size={24} aria-hidden="true" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-green-900">{t.noWarnings}</h4>
                        <p className="text-green-800 text-base">{t.noWarningsDesc}</p>
                    </div>
                </div>
            )}

            {data.medications && data.medications.length > 0 && (
                <div className="mt-8">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Pill size={20} className="text-brand-500" />
                        {t.medications}
                    </h4>
                    <div className="space-y-3">
                        {data.medications.map((med, i) => (
                            <div key={i} className="p-4 bg-white border border-gray-200 rounded-xl hover-lift">
                                <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-bold text-brand-700 text-lg">{med.name} {med.dosage}</h5>
                                </div>
                                <p className="text-gray-600 mb-1"><span className="font-medium">{med.frequency}</span></p>
                                <p className="text-gray-600">{med.purpose}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function ScheduleTab({ data, t }) {
    const schedule = data.medication_schedule;

    const timeSlotLabels = {
        morning: { label: t.morning, emoji: '🌅' },
        afternoon: { label: t.afternoon, emoji: '☀️' },
        evening: { label: t.evening, emoji: '🌇' },
        bedtime: { label: t.bedtime, emoji: '🌙' },
    };

    if (!schedule) {
        return (
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">{t.dailySchedule}</h3>
                <p className="text-gray-500">{t.noSchedule}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">{t.dailySchedule}</h3>
            <p className="text-gray-500 text-sm mb-4">{t.scheduleDesc}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(timeSlotLabels).map(([key, { label, emoji }]) => {
                    const meds = schedule[key] || [];
                    return (
                        <div key={key} className="p-4 bg-white border border-gray-200 rounded-xl hover-lift">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xl">{emoji}</span>
                                <h4 className="font-bold text-gray-900">{label}</h4>
                            </div>
                            {meds.length > 0 ? (
                                <ul className="space-y-2">
                                    {meds.map((med, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <div className="w-2 h-2 rounded-full bg-brand-500 mt-2 shrink-0"></div>
                                            <span className="text-gray-700">{med}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-400 text-sm italic">{t.noMeds}</p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}