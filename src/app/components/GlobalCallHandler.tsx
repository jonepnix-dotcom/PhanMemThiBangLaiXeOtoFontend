// components/GlobalCallHandler.tsx
import React, { useEffect, useState } from "react";
import ringSound from "../../assets/ring.mp3";   // điều chỉnh đường dẫn cho đúng
import { getSignalRConnection } from "../../app/services/signalr";

export const GlobalCallHandler: React.FC = () => {
  const connection = getSignalRConnection();

  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [isRinging, setIsRinging] = useState(false);

  // Audio chỉ tạo 1 lần
  const [audio] = useState(() => {
    const a = new Audio(ringSound);
    a.loop = true;
    a.volume = 0.3;
    return a;
  });

  // Cleanup audio khi component unmount (ít xảy ra vì component này ở mức cao)
  useEffect(() => {
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audio]);

  useEffect(() => {
    if (!connection) return;

    let isMounted = true;

    const handleIncomingCall = (data: any) => {
      if (!isMounted) return;
      
      setIncomingCall(data);
      setIsRinging(true);
      audio.play().catch(console.error);
    };

    const handleCallAccepted = () => {
      if (!isMounted) return;
      // Có thể setShowCall(true) nếu bạn muốn tự động chuyển trang
      audio.pause();
      audio.currentTime = 0;
      setIncomingCall(null);
      setIsRinging(false);
    };

    const handleCallRejected = () => {
      if (!isMounted) return;
      audio.pause();
      audio.currentTime = 0;
      setIncomingCall(null);
      setIsRinging(false);
    };

    const handleCallTimeout = () => {
      if (!isMounted) return;
      alert("⏳ Không có phản hồi từ người gọi");
      audio.pause();
      audio.currentTime = 0;
      setIncomingCall(null);
      setIsRinging(false);
    };

    // Đăng ký listener
    connection.on("IncomingCall", handleIncomingCall);
    connection.on("CallAccepted", handleCallAccepted);
    connection.on("CallRejected", handleCallRejected);
    connection.on("CallTimeout", handleCallTimeout);

    return () => {
      isMounted = false;
      connection.off("IncomingCall", handleIncomingCall);
      connection.off("CallAccepted", handleCallAccepted);
      connection.off("CallRejected", handleCallRejected);
      connection.off("CallTimeout", handleCallTimeout);
    };
  }, [connection, audio]);

  // Xử lý Accept / Reject
  const handleAccept = async () => {
    if (!connection || !incomingCall) return;

    audio.pause();
    audio.currentTime = 0;
    setIsRinging(false);

    try {
      await connection.invoke("AcceptCall", incomingCall.fromUserId);
      // Sau khi accept thì chuyển sang trang call (tùy bạn implement)
      // Ví dụ: window.location.href = "/consultation"; hoặc dùng navigate từ react-router
      setIncomingCall(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async () => {
    if (!connection || !incomingCall) return;

    audio.pause();
    audio.currentTime = 0;
    setIsRinging(false);

    try {
      await connection.invoke("RejectCall", incomingCall.fromUserId);
      setIncomingCall(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
      <div className="bg-white p-8 rounded-3xl text-center shadow-2xl w-96">
        <div className="text-6xl mb-4">📞</div>
        <h2 className="text-2xl font-bold mb-2">Cuộc gọi đến</h2>
        <p className="text-sm mb-6">
          <strong>{incomingCall.fromName}</strong> đang gọi cho bạn...
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleAccept}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-2xl font-semibold text-sm transition"
          >
            Nhận cuộc gọi
          </button>
          <button
            onClick={handleReject}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-2xl font-semibold text-sm transition"
          >
            Từ chối
          </button>
        </div>
      </div>
    </div>
  );
};