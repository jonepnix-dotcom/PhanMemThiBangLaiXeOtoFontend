import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import "../../styles/VideoCallLayout.css";
import { useSignalR } from "../contexts/SignalRContext";
import { useMicHook } from "../hooks/useMicHook";
import { useWebRTC } from "../hooks/useWebRTCHook";
import { useAudioVisualizer } from "../hooks/useAudioVisualizer";

interface Props {
    onEndCall: () => void;
    onMinimize: () => void; // thêm prop
}

const VideoCallLayout: React.FC<Props> = ({ onEndCall, onMinimize }) => {

    const { chatMessages, sendMessage: sendMessageFromContext, currentCallPartnerId, currentCallCallerId, isInCall } = useSignalR();
    const { toggleMute, isMuted, remoteStream, cleanup } = useWebRTC(currentCallPartnerId, isInCall, currentCallCallerId);

    const barsRef = useRef<HTMLDivElement[]>([]);

    const [autoScroll, setAutoScroll] = useState(true); // chế độ auto-scroll
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const [isCamOn, setIsCamOn] = useState(true);
    const [isSharing, setIsSharing] = useState(false);

    //Voice
    const { isMicOn, isSpeaking, toggleMic } = useMicHook(barsRef);

    const remoteBarsRef = useRef<HTMLDivElement[]>([]);
    const { isSpeaking: otherSpeaking } = useAudioVisualizer(remoteStream, remoteBarsRef);
    // Chat

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
        cleanup();     
        onEndCall();
    };
    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleSendMessage();
    };



    useEffect(() => {
        if (autoScroll) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatMessages, autoScroll]);

    return (
        <div className="call-container">
            {/* MAIN */}
            <div className="main">
                <div className="main-label">Share Screen or Cam Other</div>

                <div className="controls">
                    <button onClick={() => setIsCamOn(!isCamOn)}>
                        {isCamOn ? "Tắt Camera" : "Bật Camera"}
                    </button>

                    <button onClick={handleMic}>
                        {isMuted ? "Unmute" : "Mute"}
                    </button>

                    <button onClick={() => setIsSharing(!isSharing)}>
                        {isSharing ? "Dừng Chia Sẻ" : "Chia Sẻ Màn Hình"}
                    </button>

                    <button >
                        Xem Camera - Xem Màn Hình
                    </button>

                    <button onClick={onMinimize}>
                        Thu nhỏ màn hình
                    </button>
                    <button onClick={handleEndCall}>
                        Kết Thúc Cuộc Gọi
                    </button>
                </div>
            </div>

            {/* SIDEBAR */}
            <div className="sidebar">
                <div className="chat-box">
                    <div className="title">Khung Trò Chuyện
                        <button
                            className={`auto-scroll-btn ${autoScroll ? "on" : "off"}`}
                            onClick={() => setAutoScroll(!autoScroll)}
                        >
                            {autoScroll ? "Auto Scroll" : "Auto Scroll"}
                        </button>
                    </div>
                    <div className="messages">
                        {chatMessages.map((msg, idx) => {
                            const isMyMessage = msg.fromUserId === "me" || msg.fromName === "Bạn";

                            return (
                                <div
                                    key={idx}
                                    className={`message ${isMyMessage ? "left" : "right"}`}
                                >
                                    <strong>{msg.fromName}:</strong> {msg.text}
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="chat-input">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Nhập tin nhắn..."
                        />
                        <button onClick={handleSendMessage} className="send-btn">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="20"
                                height="20"
                                fill="white"
                            >
                                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="voice-box">
                    <div className="voice-item">
                        <span>Voice của họ</span>
                        <div className="wave-bars">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div
                                    key={i}
                                    ref={(el) => {
                                        if (el) remoteBarsRef.current[i] = el;
                                    }}
                                    className="bar"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="voice-item">
                        <span>Voice của bạn</span>
                        <div className="wave-bars">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div
                                    key={i}
                                    ref={(el) => {
                                        barsRef.current[i] = el!;
                                    }}
                                    className="bar"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="cam-user">
                    <div className="title">Màn hình</div>
                </div>
            </div>
        </div>
    );
};

export default VideoCallLayout;