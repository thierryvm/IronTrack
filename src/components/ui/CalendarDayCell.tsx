import React, { useState } from 'react';
import Avatar from './Avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  isSelected?: boolean;
}

// Ajoute une fonction utilitaire pour formater la date et l'heure
function formatDateTime(dateStr: string, timeStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr + (timeStr ? 'T' + timeStr : ''));
  const d = date.toLocaleDateString('fr-FR');
  const t = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `${d} - ${t}`;
}

// Migration ShadCN UI - Suppression composant Tooltip custom
// Utilisation de Popover ShadCN UI à la place

const CalendarDayCell: React.FC<CalendarDayCellProps> = ({ date, sessions, isSelected = false }) => {
  const [showPopover, setShowPopover] = useState(false);
  const [mobileSessionDetail, setMobileSessionDetail] = useState<null | Session>(null);

  // Détection mobile simple
  const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  return (
    <div className={`relative h-20 sm:h-24 p-1.5 sm:p-2 border rounded-lg bg-white dark:bg-gray-800 flex flex-col overflow-hidden transition-all duration-200 ${
      isSelected 
        ? 'border-transparent' // Pas de bordure quand sélectionné pour éviter le conflit  
        : sessions.length > 0 
          ? 'border-orange-200 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/10' 
          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
    }`}>
      <div className={`text-sm font-semibold mb-1 ${
        sessions.length > 0 ? 'text-orange-900 dark:text-orange-100' : 'text-gray-700 dark:text-gray-300'
      }`}>{date}</div>
      
      <div className="flex-1 flex flex-col gap-1">
        {/* Mode compact avec dots pour plus de 2 séances */}
        {sessions.length > 2 ? (
          <div className="space-y-1">
            {/* Première séance en détail */}
            <button
              className="flex items-center px-3 py-2 text-xs text-white font-medium rounded-md shadow-sm cursor-pointer transition-all duration-150 hover:scale-[1.02] active:scale-95 touch-manipulation w-full"
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
                  className="w-6 h-11 min-w-[24px] min-h-[24px] rounded-full shadow-sm cursor-pointer hover:scale-110 transition-transform touch-manipulation flex items-center justify-center"
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
                <span className="text-sm text-gray-600 dark:text-safe-muted ml-1 min-w-[20px] text-center">+{sessions.length - 5}</span>
              )}
            </div>
          </div>
        ) : (
          /* Mode normal pour 1-2 séances */
          sessions.slice(0, 2).map((session) => (
            <div key={session.id} className="flex items-center group">
              <button
                className="flex-1 min-h-[32px] flex items-center px-3 py-2 text-xs text-white font-medium rounded-md shadow-sm cursor-pointer transition-all duration-150 hover:scale-[1.02] active:scale-95 touch-manipulation"
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <div 
                        className="mr-1 cursor-pointer"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                          }
                        }}
                      >
                        <Avatar
                          src={session.participants[0].avatarUrl}
                          name={session.participants[0].name}
                          size={20}
                          className="border border-white dark:border-gray-600 shadow-sm"
                        />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                      <p className="text-sm">{session.participants[0].name}</p>
                    </PopoverContent>
                  </Popover>
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
        
        {/* Bouton pour voir toutes les séances si plus de 2 - ShadCN Popover */}
        {sessions.length > 2 && (
          <Popover open={showPopover} onOpenChange={setShowPopover}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 text-xs font-medium min-h-[44px] touch-manipulation w-full"
                aria-label={`Voir toutes les ${sessions.length} séances du ${date}`}
              >
                Voir tout ({sessions.length})
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 max-w-[90vw] p-3 max-h-[80vh] overflow-y-auto">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Séances du {date}</h4>
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-3 rounded-lg border bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {session.participants && session.participants.length > 0 && session.participants[0].avatarUrl && (
                            <Avatar
                              src={session.participants[0].avatarUrl}
                              name={session.participants[0].name}
                              size={24}
                              className="border border-orange-300 dark:border-orange-600"
                            />
                          )}
                          <div>
                            <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{session.name}</p>
                            {session.time && (
                              <p className="text-xs text-gray-600 dark:text-safe-muted">{session.time}</p>
                            )}
                          </div>
                        </div>
                        {session.type && (
                          <Badge variant="outline" className="text-xs">
                            {session.type}
                          </Badge>
                        )}
                      </div>
                      {session.participants && session.participants.length > 0 && (
                        <p className="text-xs text-gray-600 dark:text-safe-muted mt-1">
                          Partagée par {session.participants[0].name}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
      {/* Popover mobile pour détail séance */}
      {mobileSessionDetail && (
        <div 
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" 
          onClick={() => setMobileSessionDetail(null)}
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,  
            bottom: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-2xl p-4 w-80 max-w-full relative"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'slide-up 0.3s ease-out'
            }}
          >
            <button 
              className="absolute top-2 right-2 text-gray-700 dark:text-gray-300 hover:text-gray-700 dark:text-gray-300 p-1 rounded hover:bg-gray-100 dark:bg-gray-800 transition-colors min-h-[44px] min-w-[44px] touch-manipulation" 
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
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">{formatDateTime(mobileSessionDetail.scheduled_date, mobileSessionDetail.time)}</div>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 mb-2">
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
                <span className="text-xs text-gray-600 dark:text-safe-muted">Partagée par</span>
                <Avatar
                  src={mobileSessionDetail.participants[0].avatarUrl}
                  name={mobileSessionDetail.participants[0].name}
                  size={24}
                  className="border-2 border-white dark:border-gray-600 shadow-sm"
                />
                <span className="text-xs text-gray-600 dark:text-safe-muted">{mobileSessionDetail.participants[0].name}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarDayCell; 