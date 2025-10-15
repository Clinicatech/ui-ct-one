#!/bin/bash

# faz o merge da branch develop na main, instala dependências, faz build e copia arquivos para a pasta de deploy
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

DEPLOY_DIR="./deploy"

echo -e "${CYAN}▶ Verificando branch atual...${NC}"
BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [[ "$BRANCH" != "main" ]]; then
  echo -e "${CYAN}▶ Verificando pendências na branch atual ($BRANCH)...${NC}"
  if [[ -n $(git status --porcelain) ]]; then
    echo -e "${RED}❌ Há commits pendentes na branch '$BRANCH'. Commit ou stash antes de continuar.${NC}"
    exit 1
  fi

  echo -e "${CYAN}▶ Mudando para branch main...${NC}"
  git checkout main
fi

echo -e "${CYAN}▶ Atualizando branch main com develop...${NC}"
git merge --no-edit develop || {
  echo -e "${RED}❌ Erro ao fazer merge da develop. Abortando.${NC}"
  exit 1
}

echo -e "${CYAN}▶ Instalando dependências e build...${NC}"
pnpm install
pnpm build:prod

echo -e "${CYAN}▶ Limpando e copiando arquivos para a pasta de deploy...${NC}"
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"
cp -r dist "$DEPLOY_DIR/"
#cp -r resources "$DEPLOY_DIR/"
#cp ecosystem.config.js "$DEPLOY_DIR/"
#cp package.json "$DEPLOY_DIR/"
#cp pnpm-lock.yaml "$DEPLOY_DIR/"

echo -e "${CYAN}▶ Commitando alterações...${NC}"
git add .
git commit -m "Build e merge automático da develop" || echo -e "${CYAN}ℹ️ Nada para commitar.${NC}"

echo -e "${CYAN}▶ Enviando para o repositório remoto...${NC}"
git push origin main

echo -e "${GREEN}✅ Processo concluído com sucesso!${NC}"
