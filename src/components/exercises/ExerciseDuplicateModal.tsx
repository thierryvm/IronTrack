import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Check, Edit3, X, Clock, Target } from 'lucide-react';
import { DuplicateDetectionResult, ExerciseDuplicate } from '@/utils/exerciseDuplicateDetection';

interface ExerciseDuplicateModalProps {
  isOpen: boolean;
  onClose: () => void;
  duplicateResult: DuplicateDetectionResult;
  proposedName: string;
  onUseExisting: (exercise: ExerciseDuplicate) => void;
  onRename: (newName: string) => void;
  onCreateAnyway: () => void;
}

export const ExerciseDuplicateModal: React.FC<ExerciseDuplicateModalProps> = ({
  isOpen,
  onClose,
  duplicateResult,
  proposedName,
  onUseExisting,
  onRename,
  onCreateAnyway
}) => {
  const hasExactMatch = duplicateResult.exactMatches.length > 0;
  const hasSimilarMatch = duplicateResult.similarMatches.length > 0;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-BE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-800" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {hasExactMatch ? 'Exercice identique trouvé' : 'Exercices similaires détectés'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {hasExactMatch 
                      ? 'Un exercice avec ce nom existe déjà'
                      : 'Des exercices similaires existent dans votre bibliothèque'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Exercice proposé */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Exercice que vous voulez créer :</h3>
                <p className="text-blue-800 font-medium">"{proposedName}"</p>
              </div>

              {/* Correspondances exactes */}
              {hasExactMatch && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Check className="w-4 h-4 text-red-500" />
                    Correspondance exacte
                  </h3>
                  {duplicateResult.exactMatches.map((exercise) => (
                    <div key={exercise.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-red-900">"{exercise.name}"</p>
                          <div className="flex items-center gap-4 text-sm text-red-700 mt-1">
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {exercise.muscle_group}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Créé le {formatDate(exercise.created_at)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => onUseExisting(exercise)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                          Utiliser cet exercice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Correspondances similaires */}
              {hasSimilarMatch && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-800" />
                    Exercices similaires ({duplicateResult.similarMatches.length})
                  </h3>
                  {duplicateResult.similarMatches.slice(0, 3).map((exercise) => (
                    <div key={exercise.id} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-orange-900">"{exercise.name}"</p>
                          <div className="flex items-center gap-4 text-sm text-orange-700 mt-1">
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {exercise.muscle_group}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(exercise.created_at)}
                            </span>
                            <span className="bg-orange-200 text-orange-800 px-2 py-0.5 rounded text-xs font-medium">
                              {Math.round(exercise.similarity * 100)}% similaire
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => onUseExisting(exercise)}
                          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                        >
                          Utiliser
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Options de renommage */}
              {duplicateResult.suggestions.renameOptions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-green-500" />
                    Suggestions de noms alternatifs
                  </h3>
                  <div className="grid gap-2">
                    {duplicateResult.suggestions.renameOptions.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => onRename(option)}
                        className="text-left bg-green-50 border border-green-200 rounded-lg p-3 hover:bg-green-100 transition-colors"
                      >
                        <span className="font-medium text-green-900">"{option}"</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Annuler
                </button>
                {!hasExactMatch && (
                  <button
                    onClick={onCreateAnyway}
                    className="px-4 py-2 text-orange-700 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors font-medium"
                  >
                    Créer quand même
                  </button>
                )}
              </div>
              
              {hasExactMatch && (
                <p className="text-sm text-gray-600 mt-3 text-center">
                  💡 Il est recommandé d'utiliser l'exercice existant pour conserver votre historique de progression.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};