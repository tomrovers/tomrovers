#!/usr/bin/env bash
# Builds an installable Android test app (APK) in the Expo cloud.
#
# Needs, as environment variables:
#   EXPO_TOKEN                     an access token from expo.dev (Account settings → Access tokens)
#   EXPO_PUBLIC_SUPABASE_URL       the Supabase project URL
#   EXPO_PUBLIC_SUPABASE_ANON_KEY  the Supabase anon (public) key
# Without the two Supabase values the app only has the demo with Annelieke.
set -euo pipefail
cd "$(dirname "$0")/.."

: "${EXPO_TOKEN:?Set EXPO_TOKEN first}"
EAS="npx --yes eas-cli@latest"

# Link this app to an Expo project once (writes the project id into app.json).
$EAS init --non-interactive --force

# The Supabase values are public by design; they are baked into the app at build time.
for name in EXPO_PUBLIC_SUPABASE_URL EXPO_PUBLIC_SUPABASE_ANON_KEY; do
  value="${!name:-}"
  [ -z "$value" ] && { echo "Let op: $name ontbreekt, de app krijgt alleen de demo."; continue; }
  $EAS env:create --environment preview --name "$name" --value "$value" --visibility plaintext --force --non-interactive
done

$EAS build --platform android --profile preview --non-interactive --wait
echo "Klaar. De downloadlink van de APK staat hierboven (en op expo.dev bij Builds)."
