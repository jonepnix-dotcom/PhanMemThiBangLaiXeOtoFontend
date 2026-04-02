import React, { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { url } from '../../env.js'

interface User {
  userId: string;
  name: string;
  role: string;
  isCalling: boolean;
}

export const ConsultationAdminPage: React.FC = () => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  // Banner
  const banners = [
    "https://picsum.photos/800/400?1",
    "https://picsum.photos/800/400?2",
    "https://picsum.photos/800/400?3",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Tạo connection
  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(url + "consultationHub", {
        accessTokenFactory: () => localStorage.getItem("accessToken") || ""
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  // Start connection + nhận realtime
  useEffect(() => {
    if (!connection) return;

    connection.start()
      .then(() => {
        console.log("✅ SignalR connected");

        // nhận danh sách online
        connection.on("ReceiveOnlineUsers", (data: User[]) => {
          setUsers(data);
        });

        // đăng ký online
        if (isOnline) {
          connection.invoke("Register");
        }
      })
      .catch(err => console.error("❌ SignalR error:", err));

    return () => {
      connection.stop();
    };
  }, [connection]);

  // Toggle online/offline
  useEffect(() => {
    if (!connection) return;

    if (isOnline) {
      connection.invoke("Register");
    } else {
      connection.invoke("SetOffline");
      setUsers([]);
    }
  }, [isOnline]);

  //  Gọi user
  const handleCall = async (user: User) => {
    if (!connection) return;

    await connection.invoke("SetCalling", true);

    alert(`📞 Gọi đến ${user.name}`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-90px)] p-4 gap-4">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-red-600">
          Quản lý tư vấn trực tuyến
        </h1>

        <div className="flex items-center gap-3">

          {/* STATUS DOT */}
          <div className="relative w-4 h-4">
            {isOnline && (
              <span className="absolute w-4 h-4 rounded-full bg-green-400 opacity-40 animate-ping"></span>
            )}
            <div className={`w-4 h-4 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />
          </div>
          <div className="relative w-4 h-4">
            {isOnline && (
              <span className="absolute w-4 h-4 rounded-full bg-green-400 opacity-40 animate-ping"></span>
            )}
            <div className={`w-4 h-4 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />
          </div>
          <div className="relative w-4 h-4">
            {isOnline && (
              <span className="absolute w-4 h-4 rounded-full bg-green-400 opacity-40 animate-ping"></span>
            )}
            <div className={`w-4 h-4 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />
          </div>

          {/* BUTTON */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`w-24 h-10 flex items-center justify-center rounded-xl text-white font-semibold transition ${isOnline ? "bg-green-500" : "bg-gray-400"
              }`}
          >
            {isOnline ? "Online" : "Offline"}
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex flex-1 gap-4">

        {/* LEFT */}
        <div className="w-1/3 bg-white rounded-2xl shadow p-4 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">
            Danh sách người dùng đang online
          </h2>

          <div className="flex-1 overflow-auto">
            {!isOnline ? (
              <div className="text-gray-500 text-center mt-10">
                Bạn đang ngoại tuyến
              </div>
            ) : users.length === 0 ? (
              <div className="text-gray-500 text-center mt-10">
                Không có người dùng trực tuyến
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.userId}
                  className="flex justify-between items-center p-3 border-b"
                >
                  <div className="flex flex-col">
                    <span>{user.name}</span>
                    {user.isCalling && (
                      <span className="text-xs text-red-500">
                        Đang gọi...
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleCall(user)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
                  >
                    Gọi
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT - BANNER */}
        <div className="flex-1 bg-white rounded-2xl shadow p-4 flex flex-col items-center justify-center">
          <div className="relative w-full h-full overflow-hidden rounded-xl">
            {banners.map((img, index) => (
              <img
                key={index}
                src={img}
                alt="banner"
                className={`absolute w-full h-full object-cover transition-opacity duration-700 ${index === currentIndex ? "opacity-100" : "opacity-0"
                  }`}
              />
            ))}
          </div>

          {/* DOTS */}
          <div className="flex mt-4 gap-2">
            {banners.map((_, index) => (
              <div
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full cursor-pointer ${index === currentIndex ? "bg-blue-500" : "bg-gray-300"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};