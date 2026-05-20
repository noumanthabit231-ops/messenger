import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName: string;
  isVideo: boolean;
  currentUserId: string;
}

const CallModal: React.FC<CallModalProps> = ({ isOpen, onClose, targetUserId, targetUserName, isVideo, currentUserId }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<any>(null);

  const configuration: RTCConfiguration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }]
  };

  useEffect(() => {
    if (!isOpen) return;
    let isActive = true;

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideo });
        if (!isActive) return;
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        const pc = new RTCPeerConnection(configuration);
        peerConnectionRef.current = pc;
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          if (!isActive) return;
          setRemoteStream(event.streams[0]);
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
          setConnectionStatus('connected');
        };
        pc.onicecandidate = (event) => {
          if (event.candidate && channelRef.current) {
            channelRef.current.send({ type: 'broadcast', event: 'ice_candidate', payload: { candidate: event.candidate } });
          }
        };
        pc.onconnectionstatechange = () => {
          if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') endCall();
        };

        const channelName = `call:${[currentUserId, targetUserId].sort().join(':')}`;
        const channel = supabase.channel(channelName);
        channelRef.current = channel;

        channel
          .on('broadcast', { event: 'offer' }, async ({ payload }) => {
            if (!pc) return;
            await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            channel.send({ type: 'broadcast', event: 'answer', payload: { answer } });
          })
          .on('broadcast', { event: 'answer' }, async ({ payload }) => {
            if (!pc) return;
            await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
          })
          .on('broadcast', { event: 'ice_candidate' }, async ({ payload }) => {
            if (!pc || !payload.candidate) return;
            try { await pc.addIceCandidate(new RTCIceCandidate(payload.candidate)); } catch (e) { console.warn(e); }
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              const isInitiator = currentUserId.localeCompare(targetUserId) < 0;
              if (isInitiator && pc.signalingState === 'stable') {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                channel.send({ type: 'broadcast', event: 'offer', payload: { offer } });
              }
            }
          });
      } catch (err) {
        console.error(err);
        alert('Не удалось получить доступ к камере/микрофону. Убедитесь, что сайт открыт по HTTPS.');
        onClose();
      }
    };
    init();
    return () => {
      isActive = false;
      if (localStream) localStream.getTracks().forEach(track => track.stop());
      if (peerConnectionRef.current) peerConnectionRef.current.close();
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [isOpen, targetUserId, currentUserId, isVideo]);

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };
  const toggleCamera = () => {
    if (!isVideo || !localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    videoTrack.enabled = !videoTrack.enabled;
    setIsCameraOff(!videoTrack.enabled);
  };
  const endCall = () => { setConnectionStatus('ended'); onClose(); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <div className="relative w-full max-w-4xl bg-gray-900 rounded-2xl overflow-hidden">
        <button onClick={endCall} className="absolute top-4 right-4 z-10 p-2 bg-gray-800 rounded-full hover:bg-gray-700"><X className="text-white" size={24} /></button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
            {isVideo ? <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
              : <div className="flex flex-col items-center justify-center h-full"><PhoneOff size={48} className="text-gray-600" /><p className="text-white mt-2">{targetUserName}</p></div>}
            {!remoteStream && isVideo && <div className="absolute inset-0 flex items-center justify-center text-gray-400">Ожидание соединения...</div>}
          </div>
          <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            {isVideo && <div className="absolute bottom-2 left-2 text-xs bg-black/50 px-2 py-1 rounded text-white">Вы</div>}
          </div>
        </div>
        <div className="flex justify-center space-x-6 p-4 bg-gray-800">
          <button onClick={toggleMute} className="p-3 bg-gray-700 rounded-full">{isMuted ? <MicOff size={24} className="text-red-500" /> : <Mic size={24} className="text-white" />}</button>
          {isVideo && <button onClick={toggleCamera} className="p-3 bg-gray-700 rounded-full">{isCameraOff ? <VideoOff size={24} className="text-red-500" /> : <Video size={24} className="text-white" />}</button>}
          <button onClick={endCall} className="p-3 bg-red-600 rounded-full"><PhoneOff size={24} className="text-white" /></button>
        </div>
        <div className="text-center pb-4 text-white">{connectionStatus === 'connecting' ? 'Соединение...' : connectionStatus === 'connected' && `Звонок с ${targetUserName}`}</div>
      </div>
    </div>
  );
};
export default CallModal;
