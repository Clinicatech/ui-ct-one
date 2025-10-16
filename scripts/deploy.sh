#!/bin/bash
# Script para fazer deploy automático a partir da branch 'deploy'

set -e  # Para o script em caso de erro

DEPLOY_DIR="./deploy"
BRANCH_DEPLOY="deploy"
BRANCH_MAIN="main"

# Verifica se está na branch correta
CURRENT_BRANCH=$(git symbolic-ref --short HEAD)

if [ "$CURRENT_BRANCH" != "$BRANCH_DEPLOY" ]; then
  # Verifica se há commits pendentes
  if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️ Há mudanças não commitadas na branch atual ($CURRENT_BRANCH). Faça commit ou stash antes de continuar."
    exit 1
  fi

  echo "🚀 Mudando para branch '$BRANCH_DEPLOY'..."
  git checkout "$BRANCH_DEPLOY"
fi

# Verifica se a pasta deploy existe
if [ ! -d "$DEPLOY_DIR" ]; then
  echo "❌ A pasta '$DEPLOY_DIR' não existe. Abortei o processo."
  exit 1
fi

# Copia os arquivos da pasta deploy para a raiz, sobrescrevendo
echo "📁 Copiando arquivos de '$DEPLOY_DIR' para a raiz do projeto..."
cp -a "$DEPLOY_DIR"/. .

echo "🧹 Limpando conteúdo de '$DEPLOY_DIR'..."
rm -rf "$DEPLOY_DIR"/*

# Faz commit e push forçado
echo "✅ Commitando e fazendo push forçado..."
git add .
git commit -m "Deploy automático a partir da branch $BRANCH_MAIN" || echo "ℹ️ Nenhuma mudança para commit."
git push origin "$BRANCH_DEPLOY" --force

echo "✔️ Deploy concluído com sucesso."
