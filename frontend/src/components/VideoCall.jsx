import { useContext, useEffect, useRef, useState } from "react";
import { DataContext } from "../context/DataContext";
import peer from "../utils/peer";

const VideoCall = ({ roomId, participants }) => {
  const { socket } = useContext(DataContext);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const hasCalledRef = useRef(null); // tracks which peerId we've already called, prevents duplicate calls
  const [peerReady, setPeerReady] = useState(false);
  const [streamReady, setStreamReady] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [needsAudioUnlock, setNeedsAudioUnlock] = useState(false);

  // Attaches a remote MediaStream to the video element and plays it.
  // Browsers can block autoplay of unmuted video; if that happens we
  // show a click-to-unlock overlay instead of silently failing.
  const attachRemoteStream = (remoteStream) => {
    if (!remoteVideoRef.current) return;
    remoteVideoRef.current.srcObject = remoteStream;

    remoteVideoRef.current.play().catch(() => {
      setNeedsAudioUnlock(true);
    });
  };

  // Effect 1 — acquire camera/mic, connect to PeerJS, answer incoming calls.
  // Runs once on mount.
  useEffect(() => {
    const handleOpen = () => setPeerReady(true);

    // PeerJS may have already finished connecting before this listener
    // was attached (it's a singleton created at module load time). We
    // still need to notify React, but calling setState synchronously
    // inside the effect body triggers a cascading-render warning — so
    // defer it to a microtask, keeping it consistent with the async
    // "open" event branch below.
    if (peer.open) {
      queueMicrotask(handleOpen);
    } else {
      peer.on("open", handleOpen);
    }

    peer.on("error", (err) => {
      console.error("PeerJS connection error:", err.type, err);
    });

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        setStreamReady(true);

        // Answer any incoming call with our local stream
        peer.on("call", (call) => {
          call.answer(stream);
          call.on("stream", attachRemoteStream);
          call.on("error", (err) => console.error("Incoming call error:", err));
        });
      })
      .catch((err) => {
        console.error("Failed to access camera/microphone:", err);
      });

    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      peer.off("open", handleOpen);
    };
  }, []);

  // Effect 2 — once PeerJS is ready, tell the server our peerId so other
  // participants can find us and initiate a call.
  useEffect(() => {
    if (!peerReady) return;
    socket.emit("update-peer-id", { roomId, peerId: peer.id });
  }, [peerReady, roomId, socket]);

  // Effect 3 — call the other participant once both PeerJS and the local
  // stream are ready. Only one side initiates (whichever has the
  // lexicographically greater peerId) to avoid both sides calling each
  // other simultaneously and creating duplicate connections.
  useEffect(() => {
    if (!peerReady || !streamReady) return;

    const otherParticipant = participants.find(
      (p) => p.peerId && p.peerId !== peer.id
    );
    if (!otherParticipant) return;
    if (hasCalledRef.current === otherParticipant.peerId) return;

    const shouldInitiate = peer.id > otherParticipant.peerId;
    if (!shouldInitiate) return; // the other side will call us instead

    hasCalledRef.current = otherParticipant.peerId;

    const call = peer.call(otherParticipant.peerId, localStreamRef.current);
    call.on("stream", attachRemoteStream);
    call.on("error", (err) => console.error("Outgoing call error:", err));
  }, [peerReady, streamReady, participants]);

  const toggleMute = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMuted(!audioTrack.enabled);
    }
  };

  const toggleCamera = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCameraOff(!videoTrack.enabled);
    }
  };

  const handleUnlockAudio = () => {
    remoteVideoRef.current?.play();
    setNeedsAudioUnlock(false);
  };

  return (
    <div className="grid grid-cols-2 gap-2 bg-white rounded-lg shadow p-3">
      <div className="relative">
        <video ref={localVideoRef} autoPlay muted playsInline className="w-full rounded-lg bg-black" />
        <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-2 py-0.5 rounded">
          You
        </span>
      </div>
      <div className="relative">
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full rounded-lg bg-black" />
        <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-2 py-0.5 rounded">
          Peer
        </span>
        {needsAudioUnlock && (
          <button
            onClick={handleUnlockAudio}
            className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-sm"
          >
            Click to enable video/audio
          </button>
        )}
      </div>
      <div className="col-span-2 flex justify-center gap-2 mt-2">
        <button onClick={toggleMute} className="text-sm bg-gray-700 text-white px-3 py-1 rounded">
          {muted ? "Unmute" : "Mute"}
        </button>
        <button onClick={toggleCamera} className="text-sm bg-gray-700 text-white px-3 py-1 rounded">
          {cameraOff ? "Camera On" : "Camera Off"}
        </button>
      </div>
    </div>
  );
};

export default VideoCall;