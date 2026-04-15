import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import "../../styles/VideoCallLayout.css";
import { useSignalR } from "../contexts/SignalRContext";
import { useMicHook } from "../hooks/useMicHook";
import { useWebRTC } from "../hooks/useWebRTCHook";
import { useAudioVisualizer } from "../hooks/useAudioVisualizer";
import { useWebcamHook } from "../hooks/useWebcamHook";
import { useShareScreenHook } from "../hooks/useShareScreenHook";
import { 
    Video, VideoOff, Mic, MicOff, 
    MonitorUp, StopCircle, Minimize2, 
    PhoneOff, Send, MessageSquare 
} from "lucide-react";

interface Props {
    onEndCall: () => void;
    onMinimize: () => void; // thêm prop
}

const VideoCallLayout: React.FC<Props> = ({ onEndCall, onMinimize }) => {

    // === Webcam Hook ===
    const { isCamOn, toggleWebcam, localStream: cameraStream, videoRef, error } = useWebcamHook();
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    // === Share Screen Hook ===
    const { isSharing, startShareScreen, stopShareScreen, screenStream } = useShareScreenHook();
    const [activeStream, setActiveStream] = useState<MediaStream | null>(null);


    const { chatMessages, sendMessage: sendMessageFromContext, currentCallPartnerId, currentCallCallerId, isInCall } = useSignalR();
    const { toggleMute, isMuted, remoteVideoStream, remoteAudioStream, cleanup } = useWebRTC(currentCallPartnerId, isInCall, currentCallCallerId, activeStream);



    //Voice
    const barsRef = useRef<HTMLDivElement[]>([]);
    const { toggleMic } = useMicHook(barsRef);
    const remoteBarsRef = useRef<HTMLDivElement[]>([]);
    const { } = useAudioVisualizer(remoteAudioStream, remoteBarsRef);
    // Chat
    const [autoScroll, setAutoScroll] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const [inputText, setInputText] = useState("");



    const handleSendMessage = () => {
        if (!inputText.trim()) return;
        const text = inputText.trim();
        // Gửi tin nhắn thật lên server
        sendMessageFromContext(text);
        // Xóa ô nhập
        setInputText("");
    };
    const handleMic = () => {
        toggleMic();
        toggleMute();
    };
    const handleEndCall = async () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
        }
        cleanup();
        onEndCall();
    };
    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleSendMessage();
    };
    const handleToggleCamera = async () => {
        if (isSharing) {
            stopShareScreen();
        }

        const returnedStream = await toggleWebcam();

        // Không set null khi tắt camera → giữ stream cũ để replaceTrack sau này
        if (returnedStream) {
            setActiveStream(returnedStream);
        }
        // Nếu toggleWebcam trả về null → nghĩa là vừa tắt, nhưng chúng ta KHÔNG set null
        // để useWebRTC chỉ replaceTrack(null) thay vì destroy sender
    };

    const handleShareScreen = async () => {
        if (isSharing) {
            stopShareScreen();
            // Quay về camera
            if (isCamOn && cameraStream) {
                setActiveStream(cameraStream);
                // Force update local preview
                if (videoRef.current) {
                    videoRef.current.srcObject = cameraStream;
                }
            }
            return;
        }

        if (isCamOn) {
            await toggleWebcam();
        }

        const newScreenStream = await startShareScreen();
        if (newScreenStream) {
            setActiveStream(newScreenStream);
        }
    };
    useEffect(() => {
        if (autoScroll) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatMessages, autoScroll]);

    useEffect(() => {
        const video = remoteVideoRef.current;
        if (!video) return;

        if (remoteVideoStream) {
            video.srcObject = remoteVideoStream;
        } else {
            video.srcObject = null;
            video.load(); // 🔥 BẮT BUỘC để clear frame
        }
    }, [remoteVideoStream]);
    useEffect(() => {
    if (videoRef.current) {
        if (activeStream) {
            // Clear trước rồi set lại để tránh stale frame
            videoRef.current.srcObject = null;
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = activeStream;
                    videoRef.current.play().catch(err => 
                        console.warn("Local video autoplay failed:", err)
                    );
                }
            }, 20);
        } else {
            videoRef.current.srcObject = null;
        }
    }
}, [activeStream]);
    return (
        <div className="flex w-full h-[calc(100vh-2rem)] rounded-xl m-4 bg-slate-950 overflow-hidden shadow-2xl flex-col lg:flex-row text-slate-100">
            
            {/* MAIN VIDEO AREA */}
            <div className="flex flex-col flex-1 relative bg-black min-h-[40vh] lg:min-h-0">
                {/* User's Remote Stream Area */}
                <div className="flex-1 w-full h-full relative overflow-hidden group">
                    <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs font-medium text-white/90 truncate max-w-[150px]">Người lạ mặt</span>
                    </div>

                    {!remoteVideoStream ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                            <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center ring-4 ring-slate-800/50">
                                <VideoOff className="w-10 h-10 text-slate-500" />
                            </div>
                            <p className="text-slate-400 font-medium">Đối phương đang tắt màn hình</p>
                        </div>
                    ) : (
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-contain bg-black"
                        />
                    )}

                    {/* Local Camera Picture-in-Picture (PiP) */}
                    <div className="absolute bottom-6 right-6 w-32 sm:w-48 aspect-video bg-slate-800 rounded-xl overflow-hidden shadow-xl ring-2 ring-white/10 z-20 transition-all hover:scale-105 hover:ring-blue-500/50 cursor-move">
                        {!isCamOn ? (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-slate-800">
                                <VideoOff className="w-6 h-6 text-slate-500" />
                                <span className="text-[10px] text-slate-400">Bạn</span>
                            </div>
                        ) : (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover transform -scale-x-100"
                            />
                        )}
                        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white backdrop-blur-sm">Bạn</div>
                    </div>
                </div>

                {/* BOTTOM CONTROL BAR */}
                <div className="flex items-center justify-center p-4 lg:p-6 bg-gradient-to-t from-black/80 to-transparent gap-3 sm:gap-6 z-30 absolute bottom-0 left-0 right-0">
                    <button 
                        onClick={handleMic}
                        className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 outline-none
                            ${isMuted 
                                ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 ring-1 ring-red-500/50" 
                                : "bg-slate-700/50 text-white hover:bg-slate-700 ring-1 ring-white/10 backdrop-blur-sm"}`}
                    >
                        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>

                    <button 
                        onClick={handleToggleCamera}
                        className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 outline-none
                            ${!isCamOn 
                                ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 ring-1 ring-red-500/50" 
                                : "bg-slate-700/50 text-white hover:bg-slate-700 ring-1 ring-white/10 backdrop-blur-sm"}`}
                    >
                        {!isCamOn ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                    </button>

                    <button 
                        onClick={handleShareScreen}
                        className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 outline-none hidden sm:flex
                            ${isSharing 
                                ? "bg-blue-500 text-white hover:bg-blue-600 ring-4 ring-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                                : "bg-slate-700/50 text-white hover:bg-slate-700 ring-1 ring-white/10 backdrop-blur-sm"}`}
                    >
                        {isSharing ? <StopCircle className="w-5 h-5" /> : <MonitorUp className="w-5 h-5" />}
                    </button>

                    <div className="w-px h-8 bg-white/10 mx-2 hidden sm:block"></div>

                    <button 
                        onClick={onMinimize}
                        title="Thu nhỏ cửa sổ"
                        className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-700/50 text-white hover:bg-slate-700 ring-1 ring-white/10 backdrop-blur-sm transition-all outline-none"
                    >
                        <Minimize2 className="w-5 h-5" />
                    </button>

                    <button 
                        onClick={handleEndCall}
                        className="flex items-center justify-center px-6 h-12 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all font-medium gap-2 outline-none group hover:-translate-y-0.5"
                    >
                        <PhoneOff className="w-5 h-5 group-hover:animate-bounce" />
                        <span className="hidden sm:block">Kết thúc</span>
                    </button>
                </div>
            </div>

            {/* SIDEBAR RIGHT AREA (Chat & Audio Graph) */}
            <div className="w-full lg:w-80 2xl:w-96 bg-slate-900 border-l border-white/5 flex flex-col z-20">
                {/* Audio Visualizer Area */}
                <div className="p-4 border-b border-white/5 bg-slate-950/50">
                    <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <span>Sóng âm thanh</span>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <div className="text-[11px] text-slate-500 mb-1.5 flex items-center justify-between">
                                <span>Họ</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            </div>
                            <div className="flex items-center h-4 gap-0.5">
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <div
                                        key={`remote-bar-${i}`}
                                        ref={(el) => { if (el) remoteBarsRef.current[i] = el; }}
                                        className="w-full bg-blue-500/20 rounded-full h-1"
                                        style={{ transition: 'height 0.1s ease' }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="text-[11px] text-slate-500 mb-1.5 flex items-center justify-between">
                                <span>Bạn</span>
                                <span className={isMuted ? "w-1.5 h-1.5 rounded-full bg-red-500" : "w-1.5 h-1.5 rounded-full bg-emerald-500"}></span>
                            </div>
                            <div className="flex items-center h-4 gap-0.5 opacity-80">
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <div
                                        key={`local-bar-${i}`}
                                        ref={(el) => { if (el) barsRef.current[i] = el; }}
                                        className={`w-full rounded-full h-1 ${isMuted ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}
                                        style={{ transition: 'height 0.1s ease' }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Container */}
                <div className="flex flex-col flex-1 min-h-0 bg-slate-900/50">
                    {/* Chat Header */}
                    <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-slate-900">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-400" />
                            Trò chuyện
                        </h3>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    className="sr-only" 
                                    checked={autoScroll} 
                                    onChange={() => setAutoScroll(!autoScroll)}
                                />
                                <div className={`block w-7 h-4 rounded-full transition-colors ${autoScroll ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
                                <div className={`absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform duration-200 ease-in-out ${autoScroll ? 'transform translate-x-3' : ''}`}></div>
                            </div>
                            <span className="text-[10px] text-slate-400 group-hover:text-slate-300">Cuộn tự động</span>
                        </label>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-4 overflow-y-auto scroll-smooth space-y-3 custom-scrollbar">
                        {chatMessages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2 opacity-50">
                                <MessageSquare className="w-8 h-8" />
                                <p className="text-xs">Chưa có tin nhắn nào</p>
                            </div>
                        ) : (
                            chatMessages.map((msg, idx) => {
                                const isMyMessage = msg.fromUserId === "me" || msg.fromName === "Bạn";
                                return (
                                    <div key={idx} className={`flex flex-col ${isMyMessage ? "items-end" : "items-start"}`}>
                                        <span className="text-[10px] text-slate-500 mb-1 px-1">{msg.fromName}</span>
                                        <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm break-words
                                            ${isMyMessage 
                                            ? "bg-blue-600 text-white rounded-tr-sm" 
                                            : "bg-slate-800 text-slate-200 rounded-tl-sm border border-white/5"}`}
                                        >
                                            {msg.text}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input Area */}
                    <div className="p-3 bg-slate-950 border-t border-white/5">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Nhập tin nhắn..."
                                className="w-full bg-slate-900 border border-white/10 text-sm text-white rounded-full pl-4 pr-12 py-2.5 focus:outline-none focus:border-blue-500/50 focus:bg-slate-800 transition-all placeholder:text-slate-600"
                            />
                            <button 
                                onClick={handleSendMessage}
                                disabled={!inputText.trim()}
                                className="absolute right-1.5 p-1.5 rounded-full text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-500 transition-colors"
                            >
                                <Send className="w-4 h-4 ml-0.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoCallLayout;
