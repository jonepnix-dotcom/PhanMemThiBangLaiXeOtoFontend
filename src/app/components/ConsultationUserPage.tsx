import React, { useEffect, useState } from "react";
import { getSignalRConnection } from "../../app/services/signalr";

interface ConsultationUserPageProps {
  setShowCall: (v: boolean) => void;
}

interface User {
  userId: string;
  name: string;
  role: string;
  isCalling: boolean;
}

export const ConsultationUserPage: React.FC<ConsultationUserPageProps> = ({
  setShowCall,
}) => {
  const connection = getSignalRConnection();

  const [isOnline, setIsOnline] = useState<boolean>(() => {
    const saved = localStorage.getItem("isOnline");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [users, setUsers] = useState<User[]>([]);
  const [meCalling, setMeCalling] = useState(false);

  // Banner
  const banners = [
    "https://picsum.photos/800/400?1",
    "https://picsum.photos/800/400?2",
    "https://picsum.photos/800/400?3",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Lưu trạng thái online vào localStorage
  useEffect(() => {
    localStorage.setItem("isOnline", JSON.stringify(isOnline));
  }, [isOnline]);

  // Auto slide banner
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 🚀 Khởi tạo connection + lắng nghe events
  // 🚀 Khởi tạo connection + lắng nghe events
  useEffect(() => {
    if (!connection) return;

    let isMounted = true;

    const startConnection = async () => {
      try {
        if (connection.state === "Disconnected") {
          await connection.start();
        }

        // Off trước khi on (an toàn)
        connection.off("ReceiveOnlineUsers");
        connection.off("CallAccepted");
        connection.off("CallRejected");
        connection.off("CallTimeout");

        connection.on("ReceiveOnlineUsers", (onlineUsers: User[]) => {
          if (isMounted) setUsers(onlineUsers);
        });

        connection.on("CallAccepted", () => {
          if (isMounted) {
            setShowCall(true);
            setMeCalling(false);
          }
        });

        connection.on("CallRejected", () => {
          if (isMounted) {
            setMeCalling(false);
            // alert("Cuộc gọi bị từ chối"); // hoặc dùng toast
          }
        });

        connection.on("CallTimeout", () => {
          if (isMounted) {
            setMeCalling(false);
            alert("Cuộc gọi không có phản hồi (timeout)");
          }
        });

        if (isOnline) {
          await connection.invoke("Register");
        }
      } catch (err) {
        console.error("SignalR connection error:", err);
      }
    };

    startConnection();

    return () => {
      isMounted = false;
      // Nên off bằng tên event là đủ ở đây vì ta kiểm soát chặt
      connection.off("ReceiveOnlineUsers");
      connection.off("CallAccepted");
      connection.off("CallRejected");
      connection.off("CallTimeout");
    };
  }, [connection, isOnline, setShowCall]);   // tạm giữ, nhưng nên tối ưu sau

  // 🔄 Toggle Online / Offline
  useEffect(() => {
    if (!connection) return;

    const toggleOnlineStatus = async () => {
      try {
        if (connection.state === "Disconnected") {
          await connection.start();
        }

        if (connection.state === "Connecting") {
          await new Promise<void>((resolve) => {
            const checkInterval = setInterval(() => {
              if (connection.state === "Connected") {
                clearInterval(checkInterval);
                resolve();
              }
            }, 100);
          });
        }

        if (isOnline) {
          await connection.invoke("Register");
          console.log("🟢 User Registered");
        } else {
          await connection.invoke("SetOffline");
          setUsers([]);
          console.log("⚪ User went Offline");
        }
      } catch (err) {
        console.error("Toggle online status error:", err);
      }
    };

    toggleOnlineStatus();
  }, [isOnline, connection]);

  // 📞 Gọi cho quản lý (admin)
  const handleCall = async (user: User) => {
    if (!connection || !isOnline || meCalling) return;

    setMeCalling(true);

    try {
      await connection.invoke("CallUser", user.userId);
      // Không set false ở đây vì chờ server trả về Accepted/Rejected/Timeout
    } catch (err) {
      console.error("CallUser error:", err);
      setMeCalling(false);           // quan trọng: lỗi ngay khi invoke cũng phải reset
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-90px)] p-4 gap-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-red-600">
          Tư vấn trực tuyến
        </h1>

        <div className="flex items-center gap-3">
          {/* Status Dot */}
          <div className="relative w-4 h-4">
            {isOnline && (
              <span className="absolute w-4 h-4 rounded-full bg-green-400 opacity-40 animate-ping" />
            )}
            <div
              className={`w-4 h-4 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
            />
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setIsOnline((prev) => !prev)}
            className={`w-24 h-10 rounded-xl text-white font-semibold transition-colors ${isOnline ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 hover:bg-gray-500"
              }`}
          >
            {isOnline ? "Online" : "Offline"}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 gap-4">
        {/* LEFT - Danh sách quản lý */}
        <div className="w-1/3 bg-white rounded-2xl shadow p-4 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Danh sách quản lý</h2>

          <div className="flex-1 overflow-auto">
            {!isOnline ? (
              <div className="text-center text-gray-500 mt-10">
                Bạn đang offline
              </div>
            ) : users.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                Không có quản lý online
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.userId}
                  className="flex justify-between items-center p-3 border-b last:border-b-0"
                >
                  <div>
                    <div className="font-medium">{user.name}</div>
                    {user.isCalling && (
                      <div className="text-xs text-red-500">Đang bận</div>
                    )}
                  </div>

                  <button
                    disabled={user.isCalling || meCalling}
                    onClick={() => handleCall(user)}
                    className={`px-4 py-1.5 rounded-lg text-white font-medium transition ${user.isCalling || meCalling
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                      }`}
                  >
                    {user.isCalling || meCalling ? "Bận" : "Gọi"}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT - Banner */}
        <div className="flex-1 bg-white rounded-2xl shadow p-4 flex items-center justify-center overflow-hidden">
          <div className="relative w-full h-full rounded-xl overflow-hidden">
            {banners.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`banner-${index}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${index === currentIndex ? "opacity-100" : "opacity-0"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};