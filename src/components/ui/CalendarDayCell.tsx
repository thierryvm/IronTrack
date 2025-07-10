import React, { useState } from 'react';
import Avatar from './Avatar';

// Types pour les props
interface Session {
  id: string;
  name: string;
  time: string; // format 'HH:mm'
  color?: string; // optionnel, couleur personnalisée
  participants: Array<{
    id: string;
    name: string;
    avatarUrl: string;
  }>;
}

interface CalendarDayCellProps {
  date: number;
  sessions: Session[];
}

const MAX_SESSIONS_DISPLAY = 2;
const MAX_AVATARS_DISPLAY = 3;

const CalendarDayCell: React.FC<CalendarDayCellProps> = ({ date, sessions }) => {
  const [showPopover, setShowPopover] = useState(false);
  const [mobileSessionDetail, setMobileSessionDetail] = useState<null | Session>(null);
  const displayedSessions = sessions.slice(0, MAX_SESSIONS_DISPLAY);
  const extraSessions = sessions.length - MAX_SESSIONS_DISPLAY;

  // Déduplication robuste : clé unique basée sur id, name et avatarUrl
  const allParticipants = sessions.flatMap((s) => s.participants);
  const uniqueParticipants = Array.from(
    new Map(
      allParticipants.map((p) => [
        `${String(p.id).trim()}|${(p.name || '').trim()}|${(p.avatarUrl || '').trim()}`,
        p
      ])
    ).values()
  );

  // Détection mobile simple
  const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  return (
    <div className="relative h-24 p-1 pb-8 border border-gray-200 rounded-md bg-white flex flex-col overflow-hidden">
      <div className="text-xs font-semibold mb-1 text-gray-700">{date}</div>
      <div className="flex-1 flex flex-col gap-1">
        {displayedSessions.map((session) => (
          <div key={session.id} className="flex items-center gap-1 group">
            <div
              className="flex-1 h-6 flex items-center px-2 text-xs text-white font-medium rounded-full shadow-md cursor-pointer transition-transform duration-150"
              style={{
                background: session.color || 'linear-gradient(90deg, #ff9800 0%, #ffb347 100%)',
                borderRadius: '12px',
                minWidth: 0,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
              title={!isMobile ? `${session.name}${session.time ? ' à ' + session.time : ''}` : undefined}
              onClick={() => {
                if (isMobile) setMobileSessionDetail(session);
              }}
            >
              <span className="truncate">{session.name}{session.time && <span className="opacity-80"> à {session.time}</span>}</span>
            </div>
          </div>
        ))}
        {extraSessions > 0 && (
          <button
            className="mt-1 text-xs text-orange-600 hover:underline focus:outline-none"
            onClick={() => setShowPopover(true)}
          >
            +{extraSessions} séance{extraSessions > 1 ? 's' : ''}…
          </button>
        )}
      </div>
      {/* Pile d'avatars unique pour tous les participants du jour, placée en bas à droite */}
      <div className="absolute bottom-1 right-1 flex -space-x-2">
        {uniqueParticipants.slice(0, MAX_AVATARS_DISPLAY).map((p, idx) => {
          if (!p) return null;
          const avatarKey = `${String(p.id ?? idx).trim()}|${(p.name || '').trim()}|${(p.avatarUrl || '').trim()}`;
          return (
            <Avatar
              key={avatarKey}
              src={p.avatarUrl}
              name={p.name}
              size={28}
              className="border-2 border-white shadow-sm"
            />
          );
        })}
        {uniqueParticipants.length > MAX_AVATARS_DISPLAY && (
          <span className="w-7 h-7 flex items-center justify-center bg-orange-200 text-orange-700 text-xs rounded-full border-2 border-white shadow-sm">+{uniqueParticipants.length - MAX_AVATARS_DISPLAY}</span>
        )}
      </div>
      {/* Popover pour afficher toutes les séances du jour */}
      {showPopover && (
        <div className="absolute z-20 top-8 left-1/2 -translate-x-1/2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg p-3 animate-fade-in">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-sm">Séances du {date}</span>
            <button className="text-gray-400 hover:text-gray-700" onClick={() => setShowPopover(false)}>✕</button>
          </div>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {sessions.map((session) => (
              <li key={session.id} className="flex items-center gap-2">
                <div
                  className="h-5 w-5 rounded-full flex-shrink-0"
                  style={{ background: session.color || 'linear-gradient(90deg, #ff9800 0%, #ffb347 100%)' }}
                ></div>
                <span className="truncate text-sm font-medium">{session.name}</span>
                <span className="text-xs text-gray-500 ml-auto">{session.time}</span>
                <div className="flex -space-x-2 ml-2">
                  {(session.participants || []).slice(0, MAX_AVATARS_DISPLAY).map((p, idx) => {
                    if (!p) return null;
                    const avatarKey = `${String(p.id ?? idx).trim()}|${(p.name || '').trim()}|${(p.avatarUrl || '').trim()}`;
                    return (
                      <Avatar
                        key={avatarKey}
                        src={p.avatarUrl}
                        name={p.name}
                        className="w-5 h-5 border-2 border-white shadow-sm"
                      />
                    );
                  })}
                  {session.participants && session.participants.length > MAX_AVATARS_DISPLAY && (
                    <span className="w-5 h-5 flex items-center justify-center bg-orange-200 text-orange-700 text-xs rounded-full border-2 border-white shadow-sm">+{session.participants.length - MAX_AVATARS_DISPLAY}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Popover mobile pour détail séance */}
      {mobileSessionDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-xs w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setMobileSessionDetail(null)}>✕</button>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-full" style={{ background: (mobileSessionDetail.color || 'linear-gradient(90deg, #ff9800 0%, #ffb347 100%)') }}></div>
              <span className="font-semibold text-base">{mobileSessionDetail.name || 'Séance'}</span>
            </div>
            {mobileSessionDetail.time && (
              <div className="text-sm text-gray-600 mb-2">Heure : {mobileSessionDetail.time}</div>
            )}
            <div className="flex -space-x-2 mt-2">
              {(mobileSessionDetail.participants || []).slice(0, MAX_AVATARS_DISPLAY).map((p, idx) => {
                if (!p) return null;
                const avatarKey = `${String(p.id ?? idx).trim()}|${(p.name || '').trim()}|${(p.avatarUrl || '').trim()}`;
                return (
                  <Avatar
                    key={avatarKey}
                    src={p.avatarUrl}
                    name={p.name}
                    size={28}
                    className="border-2 border-white shadow-sm"
                  />
                );
              })}
              {mobileSessionDetail.participants && mobileSessionDetail.participants.length > MAX_AVATARS_DISPLAY && (
                <span className="w-7 h-7 flex items-center justify-center bg-orange-200 text-orange-700 text-xs rounded-full border-2 border-white shadow-sm">+{mobileSessionDetail.participants.length - MAX_AVATARS_DISPLAY}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarDayCell; 