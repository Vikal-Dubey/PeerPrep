import { useContext, useEffect, useRef, useState } from "react";
import { DataContext } from "../context/DataContext";
import peer from "../utils/peer";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from "react-icons/fa";

const VideoCall = ({ roomId, participants }) => {
  const { socket, user } = useContext(DataContext);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const hasCalledRef = useRef(null); // tracks which peerId we've already called, prevents duplicate calls
  const [peerReady, setPeerReady] = useState(false);
  const [streamReady, setStreamReady] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [needsAudioUnlock, setNeedsAudioUnlock] = useState(false);
  const [hasRemoteStream, setHasRemoteStream] = useState(false);

  const otherParticipant = participants.find((p) => p.socketId !== socket.id);

  // Attaches a remote MediaStream to the video element and plays it.
  const attachRemoteStream = (remoteStream) => {
    if (!remoteVideoRef.current) return;
    remoteVideoRef.current.srcObject = remoteStream;
    setHasRemoteStream(true);

    remoteVideoRef.current.play().catch(() => {
      setNeedsAudioUnlock(true);
    });
  };

  // Effect 1 — acquire camera/mic, connect to PeerJS, answer incoming calls.
  useEffect(() => {
    const handleOpen = () => setPeerReady(true);

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

  // Effect 2 — once PeerJS is ready, tell the server our peerId
  useEffect(() => {
    if (!peerReady) return;
    socket.emit("update-peer-id", { roomId, peerId: peer.id });
  }, [peerReady, roomId, socket]);

  // Effect 3 — call the other participant once both PeerJS and local stream are ready.
  useEffect(() => {
    if (!peerReady || !streamReady) return;

    const otherPart = participants.find(
      (p) => p.peerId && p.peerId !== peer.id
    );
    if (!otherPart) return;
    if (hasCalledRef.current === otherPart.peerId) return;

    const shouldInitiate = peer.id > otherPart.peerId;
    if (!shouldInitiate) return; // the other side will call us instead

    hasCalledRef.current = otherPart.peerId;

    const call = peer.call(otherPart.peerId, localStreamRef.current);
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
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-4 shadow-xl text-text">
      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Local stream */}
        <div className="relative aspect-video rounded-lg overflow-hidden bg-bg border border-border/80 group">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover transform -scale-x-100"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          
          <span className="absolute bottom-2 left-2 text-xs font-semibold bg-surface/80 border border-border/40 text-text px-2.5 py-1 rounded-md backdrop-blur-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {user?.username || "You"} (You)
          </span>

          {cameraOff && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg/95 text-muted gap-2">
              <FaVideoSlash className="w-8 h-8 opacity-40 text-rose-500" />
              <span className="text-xs font-mono">Camera is Turned Off</span>
            </div>
          )}
        </div>

        {/* Remote stream */}
        <div className="relative aspect-video rounded-lg overflow-hidden bg-bg border border-border/80 group">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover ${!hasRemoteStream ? "hidden" : ""}`}
          />

          {!hasRemoteStream && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg/80 text-muted gap-3 p-4 text-center">
              <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center bg-surface animate-pulse">
                <span className="w-3.5 h-3.5 rounded-full bg-accent animate-ping" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-text/80">
                  {otherParticipant ? `Connecting to ${otherParticipant.username}...` : "Waiting for Peer..."}
                </p>
                <p className="text-xs text-muted/60 font-mono">
                  {otherParticipant ? "Establishing peer connection" : "Waiting for another user to join the room"}
                </p>
              </div>
            </div>
          )}

          {hasRemoteStream && (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <span className="absolute bottom-2 left-2 text-xs font-semibold bg-surface/80 border border-border/40 text-text px-2.5 py-1 rounded-md backdrop-blur-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {otherParticipant?.username || "Peer"}
              </span>
            </>
          )}

          {needsAudioUnlock && (
            <button
              onClick={handleUnlockAudio}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 text-white text-sm font-bold gap-2 animate-fadeIn"
            >
              <span className="bg-accent-cool text-bg px-4 py-2 rounded-md hover:scale-105 active:scale-95 transition-all shadow-lg">
                Enable Remote Audio/Video
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-4 py-1.5 border-t border-border/40 mt-1">
        <button
          onClick={toggleMute}
          className={`p-3 rounded-full border transition-all flex items-center justify-center active:scale-90 ${
            muted
              ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
              : "bg-surface border-border text-text hover:bg-bg/60"
          }`}
          title={muted ? "Unmute Microphone" : "Mute Microphone"}
        >
          {muted ? <FaMicrophoneSlash className="w-5 h-5" /> : <FaMicrophone className="w-5 h-5" />}
        </button>

        <button
          onClick={toggleCamera}
          className={`p-3 rounded-full border transition-all flex items-center justify-center active:scale-90 ${
            cameraOff
              ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
              : "bg-surface border-border text-text hover:bg-bg/60"
          }`}
          title={cameraOff ? "Turn Camera On" : "Turn Camera Off"}
        >
          {cameraOff ? <FaVideoSlash className="w-5 h-5" /> : <FaVideo className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default VideoCall;