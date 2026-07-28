import Peer from "peerjs";

// Backend URL parsed from VITE_API_URL (or fallback to localhost:3000)
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
let peerHost = "localhost";
let peerPort = 3000;
let peerSecure = false;

try {
  const urlObj = new URL(apiUrl);
  peerHost = urlObj.hostname;
  peerSecure = urlObj.protocol === "https:";
  
  if (urlObj.port) {
    peerPort = parseInt(urlObj.port, 10);
  } else {
    peerPort = peerSecure ? 443 : 80;
  }
} catch (e) {
  console.error("Failed to parse VITE_API_URL for PeerJS:", e);
}

// Module-level singleton: created once when this file is first imported,
// shared by every component that needs it (avoids duplicate connections).
const peer = new Peer(undefined, {
  host: peerHost,
  port: peerPort,
  secure: peerSecure,
  path: "/peer/peerjs",
});

export default peer;