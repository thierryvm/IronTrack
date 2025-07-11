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
  scheduled_date?: string; // Ajouté pour la date de la séance
  type?: string; // Ajouté pour le type de séance
  status?: string; // Ajouté pour le statut de la séance
  duration?: number; // Ajouté pour la durée de la séance
}

interface CalendarDayCellProps {
  date: number;
  sessions: Session[];
}

const MAX_SESSIONS_DISPLAY = 2;
const MAX_AVATARS_DISPLAY = 3;

// Ajoute une fonction utilitaire pour formater la date et l'heure
function formatDateTime(dateStr: string, timeStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr + (timeStr ? 'T' + timeStr : ''));
  const d = date.toLocaleDateString('fr-FR');
  const t = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `${d} - ${t}`;
}

// Ajoute un composant Tooltip simple
const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  const [show, setShow] = useState(false);
  // Détection mobile simple
  const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (isMobile) return <>{children}</>;
  return (
    <span
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      {children}
      {show && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap" style={{ minWidth: '80px' }}>
          {text}
        </div>
      )}
    </span>
  );
};

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
    <div className="relative h-24 p-1 pb-14 border border-gray-200 rounded-md bg-white flex flex-col overflow-hidden">
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
              title={
                !isMobile && session.participants && session.participants.length > 0
                  ? `Séance partagée : ${session.name}\n${formatDateTime(session.scheduled_date || '', session.time || '')}\nPartagée par : ${session.participants[0].name}`
                  : !isMobile
                  ? `${session.name}${session.time ? ' à ' + session.time : ''}`
                  : undefined
              }
              onClick={() => {
                if (isMobile) setMobileSessionDetail(session);
              }}
            >
              {/* Avatar à gauche si séance partagée */}
              {session.participants && session.participants.length > 0 && session.participants[0].avatarUrl && (
                <Tooltip text={session.participants[0].name}>
                  <Avatar
                    src={session.participants[0].avatarUrl}
                    name={session.participants[0].name}
                    size={20}
                    className="mr-1 border-2 border-white shadow-sm bg-white"
                  />
                </Tooltip>
              )}
              <span className="truncate">{session.name}{session.time && <span className="opacity-80"> à {session.time.slice(0,5)}</span>}</span>
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
      {/* Espace réservé pour l'avatar en bas */}
      <div className="h-8 w-full" />
      {/* Popover pour afficher toutes les séances du jour */}
      {showPopover && (
        <div className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 max-w-full bg-white border border-gray-300 rounded-lg shadow-2xl p-3 animate-fade-in overflow-y-auto max-h-96">
          <div className="flex justify-between items-center mb-2 sticky top-0 bg-white z-10">
            <span className="font-semibold text-sm">Séances du {date}</span>
            <button className="text-gray-400 hover:text-gray-700" onClick={() => setShowPopover(false)}>✕</button>
          </div>
          <ul>
            {sessions.map((session) => (
              <li key={session.id} className="flex flex-col gap-1 p-2 border-b last:border-b-0">
                <div className="flex items-center gap-2">
                  <div
                    className="h-5 w-5 rounded-full flex-shrink-0"
                    style={{ background: session.color || 'linear-gradient(90deg, #ff9800 0%, #ffb347 100%)' }}
                  ></div>
                  <span className="truncate text-sm font-medium">{session.name}</span>
                  {session.time && (
                    <span className="text-xs text-gray-500 ml-2">{session.time.slice(0,5)}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                  {session.type && (
                    <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 font-semibold">{session.type}</span>
                  )}
                  {session.status && (
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">{session.status}</span>
                  )}
                  {session.duration && (
                    <span className="flex items-center gap-1">
                      <span>⏱</span>
                      <span>{session.duration} min</span>
                    </span>
                  )}
                </div>
                {/* Affichage résumé partagé : avatar après le texte */}
                {session.participants && session.participants.length > 0 && session.participants[0].avatarUrl && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">Partagée par</span>
                    <Tooltip text={session.participants[0].name}>
                      <Avatar
                        src={session.participants[0].avatarUrl}
                        name={session.participants[0].name}
                        size={20}
                        className="border-2 border-white shadow-sm"
                      />
                    </Tooltip>
                    <span className="text-xs text-gray-500">{session.participants[0].name}</span>
                  </div>
                )}
                {/* Affichage date/heure formatée */}
                {session.scheduled_date && (
                  <div className="text-xs text-gray-500 mt-1">{formatDateTime(session.scheduled_date, session.time)}</div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Popover mobile pour détail séance */}
      {mobileSessionDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-lg shadow-2xl p-4 w-80 max-w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setMobileSessionDetail(null)}>✕</button>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-full" style={{ background: (mobileSessionDetail.color || 'linear-gradient(90deg, #ff9800 0%, #ffb347 100%)') }}></div>
              <span className="font-semibold text-base">{mobileSessionDetail.name || 'Séance'}</span>
            </div>
            {/* Affichage date/heure formatée */}
            {mobileSessionDetail.scheduled_date && (
              <div className="text-sm text-gray-600 mb-2">{formatDateTime(mobileSessionDetail.scheduled_date, mobileSessionDetail.time)}</div>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
              {mobileSessionDetail.type && (
                <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 font-semibold">{mobileSessionDetail.type}</span>
              )}
              {mobileSessionDetail.status && (
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">{mobileSessionDetail.status}</span>
              )}
              {mobileSessionDetail.duration && (
                <span className="flex items-center gap-1">
                  <span>⏱</span>
                  <span>{mobileSessionDetail.duration} min</span>
                </span>
              )}
            </div>
            {/* Affichage résumé partagé : avatar après le texte */}
            {mobileSessionDetail.participants && mobileSessionDetail.participants.length > 0 && mobileSessionDetail.participants[0].avatarUrl && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">Partagée par</span>
                <Tooltip text={mobileSessionDetail.participants[0].name}>
                  <Avatar
                    src={mobileSessionDetail.participants[0].avatarUrl}
                    name={mobileSessionDetail.participants[0].name}
                    size={24}
                    className="border-2 border-white shadow-sm"
                  />
                </Tooltip>
                <span className="text-xs text-gray-500">{mobileSessionDetail.participants[0].name}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarDayCell; 