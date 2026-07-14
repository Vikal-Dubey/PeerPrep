import Peer from "peerjs";

// PeerJS runs its own signaling server (see backend/server.js) on a
// separate port from Socket.io, to avoid WebSocket upgrade conflicts.
const PEER_HOST = window.location.hostname; // "localhost" in dev
const PEER_PORT = 3001;

// Module-level singleton: created once when this file is first imported,
// shared by every component that needs it (avoids duplicate connections).
const peer = new Peer(undefined, {
  host: PEER_HOST,
  port: PEER_PORT,
  path: "/peer/peerjs",
});

export default peer;