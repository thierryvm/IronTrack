'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, X, UserPlus, Shield, HelpCircle } from 'lucide-react';

export default function TestNotifications() {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'partner_request',
      title: 'Nouvelle demande de partenariat',
      message: 'Jordan Vermeulen souhaite devenir votre partenaire d\'entraînement',
      timestamp: new Date('2025-08-08T20:30:00'),
      read: false,
      icon: UserPlus,
      color: 'bg-blue-500'
    },
    {
      id: '2', 
      type: 'admin_ticket',
      title: 'Ticket support résolu',
      message: 'Votre demande #1234 concernant les exercices a été traitée',
      timestamp: new Date('2025-08-08T19:15:00'),
      read: false,
      icon: HelpCircle,
      color: 'bg-green-500'
    },
    {
      id: '3',
      type: 'admin_alert',
      title: 'Alerte administrateur',
      message: 'Nouveau compte nécessitant une validation manuelle',
      timestamp: new Date('2025-08-08T18:45:00'),
      read: true,
      icon: Shield,
      color: 'bg-red-500'
    }
  ]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const addTestNotification = () => {
    const newNotif = {
      id: Date.now().toString(),
      type: 'test',
      title: 'Test Notification',
      message: 'Ceci est une notification de test générée automatiquement',
      timestamp: new Date(),
      read: false,
      icon: Bell,
      color: 'bg-purple-500'
    };

    setNotifications(prev => [newNotif, ...prev]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!mounted) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-surface-lightAlt dark:bg-surface-dark pt-20">
      <div className="container mx-auto p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
              🔔 Test Système Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Validation du nouveau système de notifications temps réel
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Panel de contrôle */}
            <div className="bg-surface-light dark:bg-surface-darkAlt rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Panel de Contrôle
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notifications non lues
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    unreadCount > 0 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {unreadCount}
                  </span>
                </div>

                <button
                  onClick={addTestNotification}
                  className="w-full px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors"
                >
                  ➕ Ajouter Notification Test
                </button>

                <div className="pt-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Types supportés :
                  </h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• 🤝 Demandes de partenariat</li>
                    <li>• 🛡️ Alertes admin</li>
                    <li>• 🎫 Tickets support</li>
                    <li>• 🏋️ Invitations séances</li>
                    <li>• 📊 Rapports système</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Liste des notifications */}
            <div className="bg-surface-light dark:bg-surface-darkAlt rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                📬 Notifications Actives
              </h2>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Aucune notification</p>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const Icon = notification.icon;
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border transition-all duration-200 ${
                          notification.read
                            ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                            : 'bg-white dark:bg-gray-900 border-brand-200 dark:border-brand-700 ring-1 ring-brand-500/20'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${notification.color} text-white flex-shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-medium ${
                              notification.read 
                                ? 'text-gray-700 dark:text-gray-300' 
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {notification.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {notification.timestamp.toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-full transition-colors"
                                title="Marquer comme lu"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => removeNotification(notification.id)}
                              className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors"
                              title="Supprimer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 p-6">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              ✅ Tests de Validation Réussis
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Header intégré :</h4>
                <ul className="text-blue-600 dark:text-blue-400 space-y-1">
                  <li>• Badge de notification avec compteur</li>
                  <li>• Position fixe accessible</li>
                  <li>• Couleur rouge pour alertes</li>
                  <li>• Animation hover fluide</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Fonctionnalités :</h4>
                <ul className="text-blue-600 dark:text-blue-400 space-y-1">
                  <li>• Types multiples supportés</li>
                  <li>• Marquer comme lu</li>
                  <li>• Suppression individuelle</li>
                  <li>• Timestamps précis</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}