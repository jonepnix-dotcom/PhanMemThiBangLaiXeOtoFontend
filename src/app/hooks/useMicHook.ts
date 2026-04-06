import { useEffect, useRef, useState } from "react";

export const useMicHook = (barsRef: React.RefObject<HTMLDivElement[]>) => {
    const [isMicOn, setIsMicOn] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const animationRef = useRef<number | null>(null);

    const prevVolumeRef = useRef(0);

    // 🎤 Bật mic
    const startMic = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            console.log("🎤 Mic permission granted");

            streamRef.current = stream;

            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();

            analyser.fftSize = 512;
            analyserRef.current = analyser;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            dataArrayRef.current = dataArray;

            source.connect(analyser);

            detectSpeaking();

            setIsMicOn(true);
        } catch (err) {
            console.error("❌ Mic permission denied:", err);
        }
    };

    // 🔇 Tắt mic
    const stopMic = () => {
        console.log("🔇 Mic stopped");

        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

        // Reset bars về mức yên lặng
        barsRef.current.forEach(bar => {
            if (bar) bar.style.transform = "scaleY(0.3)";
        });

        prevVolumeRef.current = 0;
        setIsSpeaking(false);
        setIsMicOn(false);
    };

    // 🔁 Toggle mic
    const toggleMic = () => {
        if (isMicOn) {
            stopMic();
        } else {
            startMic();
        }
    };

    // 🧠 Detect speaking + update visualizer trực tiếp
    const detectSpeaking = () => {
        const analyser = analyserRef.current;
        const dataArray = dataArrayRef.current;

        if (!analyser || !dataArray) return;

        const check = () => {
            analyser.getByteFrequencyData(dataArray as any);

            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
            }
            const avg = sum / dataArray.length;

            const normalized = Math.min(Math.max(avg / 30, 0), 1);
            const smoothVolume = prevVolumeRef.current * 0.8 + normalized * 0.2;
            prevVolumeRef.current = smoothVolume;

            // ✅ Cập nhật trực tiếp bars
            barsRef.current.forEach((bar) => {
                if (bar) {
                    const height = 0.3 + smoothVolume * (0.7 + Math.random() * 1.3);
                    bar.style.transform = `scaleY(${height})`;
                }
            });

            // ✅ Fix stale closure cho isSpeaking
            const speaking = avg > 8;
            setIsSpeaking(prev => (prev !== speaking ? speaking : prev));

            // Nếu bạn vẫn muốn dùng volume ở component thì uncomment dòng dưới
            // setVolume(smoothVolume);

            animationRef.current = requestAnimationFrame(check);
        };

        check();
    };

    // Cleanup khi unmount
    useEffect(() => {
        return () => {
            stopMic();
        };
    }, []);

    return {
        isMicOn,
        isSpeaking,
        toggleMic,
    };
};