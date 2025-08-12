'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, MessageCircle, Send, CheckCircle } from 'lucide-react'
import { useSupport } from '@/hooks/useSupport'
import Link from 'next/link'

export default function TestBidirectionalPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [ticketId, setTicketId] = useState('')
  const [userMessage, setUserMessage] = useState('')
  const [adminMessage, setAdminMessage] = useState('')
  const [testResults, setTestResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { 
    createTicket, 
    getTicketWithResponses, 
    addTicketResponse,
    loading 
  } = useSupport()

  // Protection contre l'hydratation SSR/client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const clearResults = () => {
    setTestResults([])
    setTicketId('')
  }

  // Test 1: Créer un ticket de test
  const testCreateTicket = async () => {
    setIsLoading(true)
    addResult('🟡 Test création ticket...')
    
    try {
      const newTicket = await createTicket({
        title: 'Test Communication Bidirectionnelle',
        description: 'Ticket automatique pour tester la communication bidirectionnelle entre utilisateur et admin.',
        category: 'help',
        priority: 'medium'
      })
      
      if (newTicket) {
        setTicketId(newTicket.id)
        addResult(`✅ Ticket créé avec succès: ${newTicket.id}`)
        addResult(`📋 Titre: ${newTicket.title}`)
        return true
      } else {
        addResult('❌ Échec création ticket')
        return false
      }
    } catch (error) {
      addResult(`❌ Erreur création: ${error}`)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Test 2: Ajouter réponse utilisateur
  const testUserResponse = async () => {
    if (!ticketId || !userMessage.trim()) {
      addResult('⚠️ ID ticket ou message utilisateur manquant')
      return
    }

    setIsLoading(true)
    addResult('🟡 Test réponse utilisateur...')
    
    try {
      const success = await addTicketResponse(ticketId, userMessage.trim(), false, false)
      
      if (success) {
        addResult('✅ Réponse utilisateur ajoutée')
        setUserMessage('')
        return true
      } else {
        addResult('❌ Échec réponse utilisateur')
        return false
      }
    } catch (error) {
      addResult(`❌ Erreur réponse utilisateur: ${error}`)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Test 3: Ajouter réponse admin
  const testAdminResponse = async () => {
    if (!ticketId || !adminMessage.trim()) {
      addResult('⚠️ ID ticket ou message admin manquant')
      return
    }

    setIsLoading(true)
    addResult('🟡 Test réponse admin...')
    
    try {
      const success = await addTicketResponse(ticketId, adminMessage.trim(), true, false)
      
      if (success) {
        addResult('✅ Réponse admin ajoutée')
        setAdminMessage('')
        return true
      } else {
        addResult('❌ Échec réponse admin')
        return false
      }
    } catch (error) {
      addResult(`❌ Erreur réponse admin: ${error}`)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Test 4: Récupérer conversation complète
  const testGetConversation = async () => {
    if (!ticketId) {
      addResult('⚠️ ID ticket manquant')
      return
    }

    setIsLoading(true)
    addResult('🟡 Test récupération conversation...')
    
    try {
      const { ticket, responses } = await getTicketWithResponses(ticketId)
      
      if (ticket) {
        addResult(`✅ Ticket récupéré: ${ticket.title}`)
        addResult(`📊 Statut: ${ticket.status}`)
        addResult(`💬 Réponses trouvées: ${responses.length}`)
        
        responses.forEach((response, index) => {
          const type = response.is_internal ? '🔧 Admin' : '👤 User'
          addResult(`  ${index + 1}. ${type}: "${response.message.slice(0, 50)}..."`)
        })
        
        return true
      } else {
        addResult('❌ Ticket non trouvé')
        return false
      }
    } catch (error) {
      addResult(`❌ Erreur récupération: ${error}`)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Test complet automatique
  const runFullTest = async () => {
    clearResults()
    addResult('🚀 Démarrage test complet communication bidirectionnelle')
    
    // Étape 1: Créer ticket
    const createSuccess = await testCreateTicket()
    if (!createSuccess) return
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Étape 2: Réponse utilisateur
    setUserMessage('Message test utilisateur - Est-ce que le support peut me répondre ?')
    await new Promise(resolve => setTimeout(resolve, 500))
    const userSuccess = await testUserResponse()
    if (!userSuccess) return
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Étape 3: Réponse admin
    setAdminMessage('Bonjour ! Équipe support ici. Nous avons bien reçu votre message.')
    await new Promise(resolve => setTimeout(resolve, 500))
    const adminSuccess = await testAdminResponse()
    if (!adminSuccess) return
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Étape 4: Vérifier conversation
    await testGetConversation()
    
    addResult('🎉 Test complet terminé !')
  }

  // Protection hydratation - afficher loader pendant l'hydratation
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'interface de test...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* En-tête */}
        <div className="mb-6">
          <Link href="/support" className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au support
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <MessageCircle className="h-6 w-6 text-orange-600 mr-3" />
              Test Communication Bidirectionnelle
            </h1>
            <p className="text-gray-600">
              Page de test pour valider les fonctionnalités de communication entre utilisateurs et admins.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Contrôles de test */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contrôles de Test</h2>
            
            <div className="space-y-4">
              
              {/* Test automatique complet */}
              <div>
                <button
                  onClick={runFullTest}
                  disabled={isLoading || loading}
                  className="w-full bg-orange-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  )}
                  Test Automatique Complet
                </button>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-3">Tests individuels:</p>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={testCreateTicket}
                    disabled={isLoading || loading}
                    className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                  >
                    1. Créer Ticket
                  </button>
                  
                  <button
                    onClick={testGetConversation}
                    disabled={isLoading || loading || !ticketId}
                    className="bg-purple-500 text-white px-3 py-2 rounded text-sm hover:bg-purple-600 disabled:opacity-50"
                  >
                    4. Voir Conversation
                  </button>
                </div>
              </div>

              {/* Messages de test */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message utilisateur:</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      placeholder="Message test utilisateur..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                    <button
                      onClick={testUserResponse}
                      disabled={isLoading || loading || !ticketId || !userMessage.trim()}
                      className="bg-green-500 text-white px-3 py-2 rounded-r-lg hover:bg-green-600 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message admin:</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={adminMessage}
                      onChange={(e) => setAdminMessage(e.target.value)}
                      placeholder="Message test admin..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                    <button
                      onClick={testAdminResponse}
                      disabled={isLoading || loading || !ticketId || !adminMessage.trim()}
                      className="bg-amber-500 text-white px-3 py-2 rounded-r-lg hover:bg-amber-600 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={clearResults}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600"
              >
                Effacer Résultats
              </button>
            </div>

            {ticketId && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm mb-3">
                  <strong>ID Ticket actuel:</strong> 
                  <code className="bg-blue-100 px-2 py-1 rounded ml-2">{ticketId}</code>
                </p>
                
                <div className="flex space-x-2">
                  <a
                    href={`/support/tickets/${ticketId}`}
                    target="_blank"
                    className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                  >
                    👤 Vue Utilisateur
                  </a>
                  <a
                    href={`/admin/tickets/${ticketId}`}
                    target="_blank"
                    className="text-xs bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 transition-colors"
                  >
                    👨‍💼 Vue Admin
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Résultats */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Résultats des Tests</h2>
            
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-400 text-sm">Aucun test exécuté. Cliquez sur "Test Automatique Complet" pour commencer.</p>
              ) : (
                <div className="space-y-1">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}