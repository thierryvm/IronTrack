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

  // Détection mobile simple
  const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  return (
    <div className={`relative h-20 sm:h-24 p-1.5 sm:p-2 border rounded-lg bg-white flex flex-col overflow-hidden transition-all duration-200 ${
      sessions.length > 0 ? 'border-orange-200 bg-orange-50/30' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className={`text-sm font-semibold mb-1 ${
        sessions.length > 0 ? 'text-orange-900' : 'text-gray-700'
      }`}>{date}</div>
      
      <div className="flex-1 flex flex-col gap-1">
        {/* Mode compact avec dots pour plus de 2 séances */}
        {sessions.length > 2 ? (
          <div className="space-y-1">
            {/* Première séance en détail */}
            <button
              className="flex items-center px-2 py-1 text-xs text-white font-medium rounded-md shadow-sm cursor-pointer transition-all duration-150 hover:scale-[1.02] active:scale-95 touch-manipulation w-full"
              style={{
                background: sessions[0].color || 'linear-gradient(90deg, #ff9800 0%, #ffb347 100%)',
              }}
              onClick={() => {
                if (isMobile) setMobileSessionDetail(sessions[0]);
              }}
              aria-label={`Détails de la séance ${sessions[0].name}`}
            >
              <span className="truncate">{sessions[0].name}</span>
            </button>
            
            {/* Dots pour les autres séances */}
            <div className="flex items-center gap-1">
              {sessions.slice(1, 5).map((session, idx) => (
                <button
                  key={idx}
                  className="w-4 h-4 rounded-full shadow-sm cursor-pointer hover:scale-125 transition-transform touch-manipulation"
                  style={{
                    background: session.color || 'linear-gradient(90deg, #ff9800 0%, #ffb347 100%)',
                  }}
                  title={session.name}
                  aria-label={`Séance ${session.name}`}
                  onClick={() => {
                    if (isMobile) setMobileSessionDetail(session);
                  }}
                />
              ))}
              {sessions.length > 5 && (
                <span className="text-xs text-gray-500 ml-1">+{sessions.length - 5}</span>
              )}
            </div>
          </div>
        ) : (
          /* Mode normal pour 1-2 séances */
          sessions.slice(0, 2).map((session) => (
            <div key={session.id} className="flex items-center group">
              <button
                className="flex-1 min-h-8 flex items-center px-2 py-1 text-xs text-white font-medium rounded-md shadow-sm cursor-pointer transition-all duration-150 hover:scale-[1.02] active:scale-95 touch-manipulation"
                style={{
                  background: session.color || 'linear-gradient(90deg, #ff9800 0%, #ffb347 100%)',
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
                aria-label={`Séance ${session.name}${session.time ? ' à ' + session.time : ''}`}
              >
                {/* Avatar compact pour séances partagées */}
                {session.participants && session.participants.length > 0 && session.participants[0].avatarUrl && (
                  <Tooltip text={session.participants[0].name}>
                    <Avatar
                      src={session.participants[0].avatarUrl}
                      name={session.participants[0].name}
                      size={16}
                      className="mr-1 border border-white shadow-sm bg-white"
                    />
                  </Tooltip>
                )}
                <span className="truncate">
                  {session.name}
                  {session.time && (
                    <span className="opacity-80 ml-1 text-xs hidden sm:inline">
                      {session.time.slice(0,5)}
                    </span>
                  )}
                </span>
              </button>
            </div>
          ))
        )}
        
        {/* Bouton pour voir toutes les séances si plus de 2 */}
        {sessions.length > 2 && (
          <button
            className="mt-1 py-1 text-xs text-orange-600 hover:text-orange-800 hover:bg-orange-100 rounded-md transition-colors focus:outline-none font-medium min-h-[44px] touch-manipulation"
            onClick={() => setShowPopover(true)}
            aria-label={`Voir toutes les ${sessions.length} séances du ${date}`}
          >
            Voir tout ({sessions.length})
          </button>
        )}
      </div>
      {/* Popover pour afficher toutes les séances du jour */}
      {showPopover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowPopover(false)}>
          <div 
            className="w-80 max-w-[90vw] bg-white border border-gray-300 rounded-lg shadow-2xl p-3 overflow-y-auto max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2 sticky top-0 bg-white z-10">
              <span className="font-semibold text-sm">Séances du {date}</span>
              <button 
                className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors min-h-[44px] touch-manipulation" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPopover(false);
                }}
                aria-label="Fermer la liste des séances"
              >
                ✕
              </button>
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
        </div>
      )}
      {/* Popover mobile pour détail séance */}
      {mobileSessionDetail && (
        <div 
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4" 
          onClick={() => setMobileSessionDetail(null)}
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl p-4 w-80 max-w-full relative animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] touch-manipulation" 
              onClick={(e) => {
                e.stopPropagation();
                setMobileSessionDetail(null);
              }}
              aria-label="Fermer les détails de la séance"
            >
              ✕
            </button>
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