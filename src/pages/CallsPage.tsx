import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Phone, Video, PhoneOff, PhoneMissed, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function CallsPage() {
  const { user } = useAuthStore();
  const [calls, setCalls] = useState<any[]>([]);

  useEffect(() => {
    const fetchCalls = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from('calls')
        .select('*, caller:caller_id(full_name, username), callee:callee_id(full_name, username)')
        .or(`caller_id.eq.${user.id},callee_id.eq.${user.id}`)
        .order('started_at', { ascending: false });
      if (data) setCalls(data);
    };
    fetchCalls();
  }, [user]);

  const getOtherUser = (call: any) => {
    if (call.caller_id === user?.id) return call.callee;
    return call.caller;
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto h-full overflow-y-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">История звонков</h1>
      <div className="space-y-3">
        {calls.map(call => {
          const other = getOtherUser(call);
          const isOutgoing = call.caller_id === user?.id;
          const statusIcon = call.status === 'missed' ? <PhoneMissed size={18} className="text-red-500" /> :
                             call.status === 'answered' ? <Phone size={18} className="text-green-500" /> :
                             <PhoneOff size={18} className="text-yellow-500" />;
          return (
            <div key={call.id} className="bg-[#2d3748] rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  {call.call_type === 'video' ? <Video size={20} /> : <Phone size={20} />}
                </div>
                <div>
                  <p className="text-white font-medium">{other?.full_name || other?.username}</p>
                  <p className="text-gray-400 text-xs flex items-center gap-1">
                    {statusIcon}
                    <span>
                      {isOutgoing ? 'Исходящий' : 'Входящий'} • {call.status === 'missed' ? 'Пропущен' : call.status === 'answered' ? 'Состоялся' : 'Отклонён'}
                    </span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs">{formatDistanceToNow(new Date(call.started_at), { addSuffix: true, locale: ru })}</p>
              </div>
            </div>
          );
        })}
        {calls.length === 0 && <p className="text-gray-500 text-center py-8">Звонков пока нет</p>}
      </div>
    </div>
  );
}
