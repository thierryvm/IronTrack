import React, { useRef, useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Plus } from 'lucide-react';

interface UserSound {
  id: string;
  name: string;
  file_url: string;
  created_at: string;
}

interface SoundLibraryProps {
  userId: string;
  selectedSoundId?: string;
  onSoundAdded?: () => void;
  onSoundDeleted?: (sound: UserSound) => void;
}

export default function SoundLibrary({ userId, selectedSoundId, onSoundAdded, onSoundDeleted }: SoundLibraryProps) {
  const [sounds, setSounds] = useState<UserSound[]>([]);
  const [uploading, setUploading] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAddExternal, setShowAddExternal] = useState(false);
  const [externalUrl, setExternalUrl] = useState('');
  const [externalName, setExternalName] = useState('');
  const [externalError, setExternalError] = useState<string | null>(null);

  useEffect(() => {
    fetchSounds();
    // Cleanup audio on unmount
    return () => { if (audio) audio.pause(); };
    // eslint-disable-next-line
  }, []);

  const fetchSounds = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('user_sounds')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (!error && data) setSounds(data);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploading(true);
    const supabase = createClient();
    const filePath = `${userId}/${Date.now()}-${file.name}`;
    // Upload to storage
    const { error: storageError } = await supabase.storage
      .from('user-sounds')
      .upload(filePath, file, {
        upsert: false,
        contentType: file.type || 'audio/mpeg',
      });
    if (storageError) { setUploading(false); e.target.value = ''; return; }
    // Get public URL
    const { data: urlData } = supabase.storage.from('user-sounds').getPublicUrl(filePath);
    // Insert in DB
    await supabase.from('user_sounds').insert({
      user_id: userId,
      name: file.name,
      file_url: urlData.publicUrl,
    });
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    fetchSounds();
    onSoundAdded?.();
  };

  const handleDelete = async (sound: UserSound) => {
    const supabase = createClient();
    // Delete from storage
    const path = sound.file_url.split('/user-sounds/')[1];
    await supabase.storage.from('user-sounds').remove([path]);
    // Delete from DB
    await supabase.from('user_sounds').delete().eq('id', sound.id);
    if (fileInputRef.current) fileInputRef.current.value = '';
    fetchSounds();
    onSoundDeleted?.(sound);
  };

  const handleRename = async (sound: UserSound) => {
    if (!newName.trim()) return;
    const supabase = createClient();
    await supabase.from('user_sounds').update({ name: newName.trim() }).eq('id', sound.id);
    setRenamingId(null);
    setNewName('');
    fetchSounds();
  };

  const handlePlay = (sound: UserSound) => {
    if (audio) audio.pause();
    setErrorMsg(null);
    const newAudio = new Audio(sound.file_url);
    setAudio(newAudio);
    setPlayingId(sound.id);
    newAudio.play().catch(() => {
      setErrorMsg('Impossible de lire ce fichier audio. Format non supporté ou URL invalide.');
      setPlayingId(null);
    });
    newAudio.onended = () => setPlayingId(null);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const validateExternalUrl = (url: string) => {
    // Autorise uniquement mp3, wav, ogg, pas de javascript:, pas de .php, pas de query suspecte
    const pattern = /^(https?:\/\/)[^\s]+\.(mp3|wav|ogg)(\?.*)?$/i;
    return pattern.test(url.trim());
  };

  const handleAddExternal = async () => {
    setExternalError(null);
    if (!externalUrl.trim() || !externalName.trim()) {
      setExternalError('Nom et URL requis.');
      return;
    }
    if (!validateExternalUrl(externalUrl)) {
      setExternalError('URL invalide ou format non supporté. (mp3, wav, ogg uniquement)');
      return;
    }
    const supabase = createClient();
    await supabase.from('user_sounds').insert({
      user_id: userId,
      name: externalName.trim(),
      file_url: externalUrl.trim(),
    });
    setExternalUrl('');
    setExternalName('');
    setShowAddExternal(false);
    fetchSounds();
    onSoundAdded?.();
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bibliothèque de sons</span>
        <div className="flex gap-2">
          <button
            onClick={handleUploadClick}
            className="flex items-center gap-2 px-3 py-2 bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 text-white rounded-lg font-semibold shadow transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300"
            disabled={uploading}
          >
            <Plus className="h-6 w-6" /> {uploading ? 'Upload...' : 'Ajouter un son'}
          </button>
          <button
            onClick={() => setShowAddExternal(v => !v)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <Plus className="h-6 w-6" /> Lien externe
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
      </div>
      {showAddExternal && (
        <div className="mb-4 flex flex-col sm:flex-row items-center gap-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <input
            type="text"
            placeholder="Nom du son"
            value={externalName}
            onChange={e => setExternalName(e.target.value)}
            className="border rounded px-2 py-1 text-sm flex-1"
          />
          <input
            type="url"
            placeholder="https://.../mon-son.mp3"
            value={externalUrl}
            onChange={e => setExternalUrl(e.target.value)}
            className="border rounded px-2 py-1 text-sm flex-1"
          />
          <button
            onClick={handleAddExternal}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded font-semibold"
          >Ajouter</button>
          <button
            onClick={() => { setShowAddExternal(false); setExternalUrl(''); setExternalName(''); setExternalError(null); }}
            className="text-gray-600 dark:text-safe-muted hover:text-gray-700 dark:text-gray-300 text-xs ml-2"
          >Annuler</button>
          {externalError && <span className="text-xs text-safe-error ml-2">{externalError}</span>}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {sounds.length === 0 && <div className="text-xs text-gray-600 dark:text-safe-muted col-span-full">Aucun son enregistré.</div>}
        {sounds.map(sound => (
          <div key={sound.id} className={`flex flex-col gap-2 p-4 rounded-xl shadow-sm border border-[#E5E7EB] bg-[#F6F8FA] hover:shadow-md transition ${selectedSoundId === sound.id ? 'border-orange-600 bg-orange-100' : ''}`}
            style={{minWidth:0}}>
            <div className="flex flex-col gap-1 w-full">
              {renamingId === sound.id ? (
                <div className="flex flex-col w-full gap-2">
                  <input
                    value={newName || sound.name}
                    onChange={e => setNewName(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-base w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  focus:ring-2 focus:ring-orange-400 text-gray-900 dark:text-gray-100"
                    style={{fontSize:'1rem'}}
                    placeholder="Nouveau nom du son"
                    onFocus={e => e.target.select()}
                    onKeyDown={e => { if (e.key === 'Enter') handleRename(sound); if (e.key === 'Escape') { setRenamingId(null); setNewName(''); } }}
                    autoFocus
                  />
                  <div className="flex flex-row justify-center gap-4 mt-1">
                    <button onClick={() => handleRename(sound)} className="text-green-600 text-xl" title="Valider" style={{padding:'0 6px'}}><svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></button>
                    <button onClick={() => { setRenamingId(null); setNewName(''); }} className="text-gray-700 dark:text-gray-300 text-xl" title="Annuler" style={{padding:'0 6px'}}><svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="block text-base font-semibold text-gray-900 dark:text-gray-100 truncate mb-0.5">{sound.name}</span>
                </>
              )}
            </div>
            <div className="flex flex-row flex-wrap gap-2 mt-4 w-full justify-center items-center min-h-[48px]">
              <button onClick={() => handlePlay(sound)} className="text-safe-info hover:text-blue-700 bg-blue-50 rounded-full p-3 shadow flex-shrink-0" title="Écouter" aria-label="Écouter le son" style={{minWidth:40, minHeight:40}}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
              </button>
              <button onClick={() => { setRenamingId(sound.id); setNewName(sound.name); }} className="text-safe-warning hover:text-yellow-600 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  border border-yellow-200 rounded-full p-3 shadow flex-shrink-0" title="Renommer" aria-label="Renommer le son" style={{minWidth:40, minHeight:40}}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
              </button>
              <button onClick={() => handleDelete(sound)} className="text-safe-error hover:text-red-700 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  border border-red-200 rounded-full p-3 shadow flex-shrink-0" title="Supprimer" style={{minWidth:40, minHeight:40}}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
              </button>
              {playingId === sound.id && <span className="text-xs text-green-600 ml-2">Lecture...</span>}
            </div>
          </div>
        ))}
      </div>
      {errorMsg && <div className="text-xs text-safe-error mt-2">{errorMsg}</div>}
    </div>
  );
} 