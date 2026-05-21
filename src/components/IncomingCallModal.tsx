import React, { useEffect, useRef } from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';

interface IncomingCallModalProps {
  callerId: string;
  callerName: string;
  isVideo: boolean;
  onAnswer: () => void;
  onReject: () => void;
}

const IncomingCallModal: React.FC<IncomingCallModalProps> = ({ callerName, isVideo, onAnswer, onReject }) => {
  const [seconds, setSeconds] = React.useState(0);
  const ringtoneOscRef = useRef<OscillatorNode | null>(null);
  const ringtoneGainRef = useRef<GainNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Звук входящего звонка (прерывистый)
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 440;
      gain.gain.value = 0.3;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      let toggle = true;
      const interval = setInterval(() => {
        if (!ringtoneGainRef.current) return;
        toggle = !toggle;
        ringtoneGainRef.current.gain.value = toggle ? 0.3 : 0;
      }, 800);
      ringtoneOscRef.current = osc;
      ringtoneGainRef.current = gain;
      (osc as any).interval = interval;
    } catch (e) { console.warn(e); }

    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => {
      clearInterval(timer);
      if (ringtoneOscRef.current) {
        clearInterval((ringtoneOscRef.current as any).interval);
        ringtoneOscRef.current.stop();
        ringtoneOscRef.current.disconnect();
      }
      if (ringtoneGainRef.current) ringtoneGainRef.current.disconnect();
      if (audioCtxRef.current) audioCtxRef.current.close().catch(console.warn);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center">
      <div className="bg-[#2d3748] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-blue-500/50">
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto bg-blue-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
            {isVideo ? <Video size={40} className="text-white" /> : <Phone size={40} className="text-white" />}
          </div>
          <h2 className="text-xl font-bold text-white mb-1">{callerName}</h2>
          <p className="text-gray-400 text-sm">{isVideo ? 'Видеозвонок' : 'Аудиозвонок'}</p>
          <p className="text-gray-500 text-xs mt-2">{seconds} сек.</p>
        </div>
        <div className="flex justify-center gap-4">
          <button onClick={onAnswer} className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition-all active:scale-95">
            <Phone size={28} className="text-white" />
          </button>
          <button onClick={onReject} className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-all active:scale-95">
            <PhoneOff size={28} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
