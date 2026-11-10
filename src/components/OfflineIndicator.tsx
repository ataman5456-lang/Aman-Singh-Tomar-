import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Language } from '../types';

interface OfflineIndicatorProps {
  lang: Language;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ lang }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto z-50 flex items-center gap-2 rounded-xl bg-amber-500/95 text-amber-950 backdrop-blur-md px-3.5 py-2 text-xs font-semibold shadow-lg border border-amber-400 animate-in slide-in-from-bottom duration-300">
      <WifiOff className="w-4 h-4 shrink-0 text-amber-950" />
      <span>{lang === 'hi' ? 'ऑफ़लाइन मोड – स्थानीय डेटा सक्रिय है' : 'Offline Mode – All tools working locally'}</span>
    </div>
  );
};
