import { useRef, useState, useEffect, useCallback } from 'react';
import { X, Camera as CameraIcon, RefreshCw, Check } from 'lucide-react';
import { motion as Motion } from 'framer-motion';

// Preprocess image for better OCR: grayscale + mild contrast boost
function preprocessForOCR(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        // Grayscale
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

        // Mild contrast boost (factor 1.3)
        const contrast = Math.min(255, Math.max(0, ((gray - 128) * 1.3) + 128));

        data[i] = contrast;
        data[i + 1] = contrast;
        data[i + 2] = contrast;
    }

    ctx.putImageData(imageData, 0, 0);
}

export default function CameraCapture({ onCapture, onClose }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [error, setError] = useState('');
    const [previewImage, setPreviewImage] = useState(null);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const streamRef = useRef(null);

    const stopCamera = () => {
        setIsVideoReady(false);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const startCamera = useCallback(async () => {
        setIsVideoReady(false);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 2560 },
                    height: { ideal: 1920 },
                    focusMode: { ideal: 'continuous' },
                }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play().catch(e => console.error("Play error:", e));
            }
        } catch (err) {
            setError('Failed to open camera. Please check camera permissions in your browser.');
            console.error('Camera error:', err);
        }
    }, []);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, [startCamera]);

    const handleVideoLoadedMetadata = () => {
        setIsVideoReady(true);
    };

    const handleCapture = () => {
        if (!isVideoReady) return;

        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Show raw preview to user
            const rawPreview = canvas.toDataURL('image/jpeg', 0.95);
            setPreviewImage(rawPreview);
        }
    };

    const handleRetake = () => {
        setPreviewImage(null);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.play().catch(e => console.error("Retake play error:", e));
        }
    };

    const handleUsePhoto = () => {
        if (previewImage) {
            stopCamera();
            // Send the raw high-res capture directly — Tesseract handles it better unprocessed
            onCapture(previewImage);
        }
    };

    const handleClose = () => {
        stopCamera();
        onClose();
    };

    return (
        <Motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black z-[99999] flex flex-col items-center justify-center safe-area-pt"
        >
            <div className="absolute top-6 right-6 z-[99999]">
                <button
                    onClick={handleClose}
                    className="flex shrink-0 items-center justify-center w-12 h-12 bg-black/60 backdrop-blur-md text-white border border-white/20 rounded-full hover:bg-black/80 transition-colors focus:ring-4 focus:ring-white pointer-events-auto shadow-lg"
                    aria-label="Close camera"
                >
                    <X size={24} />
                </button>
            </div>

            {error ? (
                <div className="text-white text-center p-8 max-w-sm z-10">
                    <div className="bg-red-500/10 text-red-400 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <CameraIcon size={32} />
                    </div>
                    <p className="text-lg leading-relaxed mb-6">{error}</p>
                    <button
                        onClick={handleClose}
                        className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors w-full shadow-lg"
                    >
                        Go Back
                    </button>
                </div>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        onLoadedMetadata={handleVideoLoadedMetadata}
                        className="w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Document alignment guide */}
                    {!previewImage && isVideoReady && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                            <div className="w-[85%] h-[65%] border-2 border-white/40 rounded-2xl">
                                <div className="absolute -bottom-8 left-0 right-0 text-center">
                                    <span className="text-white/70 text-sm bg-black/40 px-3 py-1 rounded-full">
                                        Align document within frame
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {!previewImage && (
                        <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 bg-gradient-to-t from-black/80 to-transparent flex justify-center z-10">
                            <Motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleCapture}
                                disabled={!isVideoReady}
                                className={`w-20 h-20 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-brand-500 shadow-2xl ${!isVideoReady ? 'opacity-50 cursor-not-allowed' : ''}`}
                                aria-label="Take photo"
                            >
                                <div className="w-[60px] h-[60px] bg-white border-2 border-gray-200 rounded-full shadow-inner"></div>
                            </Motion.button>
                        </div>
                    )}

                    {/* Preview with retake/use options */}
                    {previewImage && (
                        <div className="absolute inset-0 z-50 flex flex-col transition-all">
                            <img src={previewImage} alt="Captured preview" className="w-full h-full object-contain" />
                            <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 bg-gradient-to-t from-black/80 to-transparent flex justify-center sm:gap-6 gap-4">
                                <button
                                    onClick={handleRetake}
                                    className="px-5 py-3 sm:px-6 bg-black/60 backdrop-blur-md text-white font-bold border border-white/20 rounded-xl hover:bg-black/80 transition-colors flex items-center gap-2 shadow-lg"
                                >
                                    <RefreshCw size={20} />
                                    <span className="hidden sm:inline">Retake Photo</span>
                                    <span className="sm:hidden">Retake</span>
                                </button>
                                <button
                                    onClick={handleUsePhoto}
                                    className="px-5 py-3 sm:px-6 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors flex items-center gap-2 shadow-lg"
                                >
                                    <Check size={20} />
                                    Use Photo
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </Motion.div>
    );
}