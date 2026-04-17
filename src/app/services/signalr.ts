// services/signalr.ts
import * as signalR from "@microsoft/signalr";
import { url } from "../../env";
import { AuthService } from "./authService";

let connection: signalR.HubConnection | null = null;

export const getSignalRConnection = () => {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(url + "consultationHub", {
        accessTokenFactory: () => AuthService.getToken() || ""
      })
      .withAutomaticReconnect()
      .build();
  }
  return connection;
};
export const resetSignalRConnection = () => {
  if (connection) {
    connection.stop().catch(() => { });
    connection = null;
  }
};
