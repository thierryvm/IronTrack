#!/bin/bash

# Script bash pour rafraîchir le cache PostgREST Supabase
# Usage: bash scripts/refresh-cache.sh

set -e

# Configuration (à adapter selon votre projet)
SUPABASE_URL="https://taspdceblvmpvdjixyit.supabase.co"
SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhc3BkY2VibHZtcHZkaml4eWl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTc1NDc3NiwiZXhwIjoyMDY3MzMwNzc2fQ.K32qBRR6E5gmNFtSNYxaKKH9kcYbF0Wc73ewBwq3QkI}"

echo "🔄 Rafraîchissement du cache PostgREST..."
echo ""

# Méthode 1: RPC Function
echo "⏳ Tentative: RPC Function refresh_postgrest_schema_cache"
response1=$(curl -s -w "%{http_code}" -X POST \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  "$SUPABASE_URL/rest/v1/rpc/refresh_postgrest_schema_cache")

http_code1="${response1: -3}"
body1="${response1%???}"

if [ "$http_code1" -eq 200 ] || [ "$http_code1" -eq 201 ]; then
  echo "✅ Succès: RPC Function"
  echo "   Réponse: $body1"
  success_count=1
else
  echo "❌ Échec: RPC Function (HTTP $http_code1)"
  echo "   Erreur: $body1"
  success_count=0
fi

echo ""

# Méthode 2: Admin Endpoint  
echo "⏳ Tentative: Admin reload-schema endpoint"
response2=$(curl -s -w "%{http_code}" -X POST \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  "$SUPABASE_URL/rest/v1/admin/reload-schema")

http_code2="${response2: -3}"
body2="${response2%???}"

if [ "$http_code2" -eq 200 ] || [ "$http_code2" -eq 201 ]; then
  echo "✅ Succès: Admin endpoint"
  echo "   Réponse: $body2"
  ((success_count++))
else
  echo "❌ Échec: Admin endpoint (HTTP $http_code2)"
  echo "   Erreur: $body2"
fi

echo ""

# Test de validation
echo "🧪 Test de validation..."
test_response=$(curl -s -w "%{http_code}" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  "$SUPABASE_URL/rest/v1/performance_logs?select=rest_seconds&limit=1")

test_http_code="${test_response: -3}"
test_body="${test_response%???}"

if [ "$test_http_code" -eq 200 ] && [[ "$test_body" == *"rest_seconds"* ]]; then
  echo "✅ Validation: colonne rest_seconds accessible"
  echo "   Données: $test_body"
else
  echo "❌ Validation échouée: colonne rest_seconds non accessible"
  echo "   Réponse: $test_body"
fi

echo ""
echo "🎯 Résumé: $success_count/2 méthodes ont réussi"

if [ "$success_count" -gt 0 ]; then
  echo ""
  echo "✨ Le cache PostgREST a été rafraîchi avec succès !"
  echo "   Vos migrations devraient maintenant être visibles dans l'API REST."
else
  echo ""
  echo "⚠️  Aucune méthode n'a réussi. Solutions alternatives:"
  echo "   1. Attendre 5-10 minutes (rafraîchissement automatique)"
  echo "   2. Redémarrer votre instance Supabase depuis le dashboard"
  echo "   3. Utiliser: npm run db:refresh-cache"
  echo "   4. Contacter le support Supabase si le problème persiste"
fi