#!/bin/sh
# Hook de fin (Stop) de Claude Code : relance les tests de tools/ avant que l'agent rende la main.
# S'ils échouent, le code de sortie 2 renvoie l'erreur à l'agent, qui doit corriger avant de terminer.

# Évite une boucle : si l'agent repasse déjà par ce hook, on le laisse s'arrêter.
if grep -Eq '"stop_hook_active" *: *true'; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR" || exit 0

# Le Node du système est trop ancien : on prend le Node 24 installé par nvm s'il existe.
NVM_NODE=$(ls -d "$HOME"/.nvm/versions/node/v24*/bin 2>/dev/null | tail -n 1)
[ -n "$NVM_NODE" ] && PATH="$NVM_NODE:$PATH"

if ! output=$(npm run --silent test:tools 2>&1); then
  echo "$output" | tail -n 40 >&2
  echo "Les tests de tools/ échouent : corrige-les avant de terminer." >&2
  exit 2
fi
