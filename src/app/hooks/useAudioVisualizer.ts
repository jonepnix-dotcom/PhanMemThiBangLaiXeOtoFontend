import { useEffect, useRef, useState } from "react";

export const useAudioVisualizer = (stream: MediaStream | null, barsRef: React.RefObject<HTMLDivElement[]>) => {
    const [isSpeaking, setIsSpeaking] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const animationRef = useRef<number | null>(null);
    const prevVolumeRef = useRef(0);

    useEffect(() => {
    if (!stream) {
        // reset bars
        barsRef.current.forEach(bar => {
            if (bar) bar.style.transform = "scaleY(0.3)";
        });
        setIsSpeaking(false);
        return;
    }

    // Cleanup cũ nếu có
    if (audioContextRef.current) {
        audioContextRef.current.close();
    }
    if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
    }

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

    const check = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);

        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
            sum += dataArrayRef.current[i];
        }
        const avg = sum / dataArrayRef.current.length;

        const normalized = Math.min(Math.max(avg / 30, 0), 1);
        const smoothVolume = prevVolumeRef.current * 0.8 + normalized * 0.2;
        prevVolumeRef.current = smoothVolume;

        barsRef.current.forEach(bar => {
            if (bar) {
                const height = 0.3 + smoothVolume * (0.7 + Math.random() * 1.3);
                bar.style.transform = `scaleY(${Math.max(height, 0.1)})`;
            }
        });

        setIsSpeaking(avg > 8);

        animationRef.current = requestAnimationFrame(check);
    };

    check();

    return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => {});
        }
    };
}, [stream]);   // ← Phụ thuộc vào stream (object reference)

    
    return { isSpeaking };
};