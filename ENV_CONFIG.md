# Configuração de Variáveis de Ambiente

Este documento descreve as variáveis de ambiente utilizadas no projeto UI CT One.

## Variáveis Disponíveis

### VITE_BASENAME

Define o basename para o React Router, permitindo diferentes configurações para cada ambiente.

**Valores possíveis:**

- `/` - Para desenvolvimento local (sem subdiretório)
- `/ui-ct-one` - Para produção (com subdiretório)

### VITE_API_BASE_URL

Define a URL base para as chamadas da API, deve ser consistente com o basename.

**Valores possíveis:**

- `/api` - Para desenvolvimento local
- `/ui-ct-one/api` - Para produção

## Configuração por Ambiente

### Desenvolvimento Local

```bash
# Copie o arquivo de exemplo
cp env.example .env

# Ou configure diretamente
echo "VITE_BASENAME=/" > .env
echo "VITE_API_BASE_URL=/api" >> .env
```

### Produção

```bash
# Configure para produção
echo "VITE_BASENAME=/ui-ct-one" > .env
echo "VITE_API_BASE_URL=/ui-ct-one/api" >> .env
```

## Arquivos de Configuração

- `env.example` - Template com configurações padrão
- `env.development` - Configuração para desenvolvimento
- `env.production` - Configuração para produção

## Como Usar

1. **Desenvolvimento**: Use `VITE_BASENAME=/` e `VITE_API_BASE_URL=/api` para desenvolvimento local
2. **Produção**: Use `VITE_BASENAME=/ui-ct-one` e `VITE_API_BASE_URL=/ui-ct-one/api` para deploy em subdiretório
3. **Teste**: Configure conforme necessário para ambiente de teste

## Importante

- As variáveis de ambiente do Vite devem começar com `VITE_`
- O arquivo `.env` está no `.gitignore` e não deve ser commitado
- Sempre use os arquivos de exemplo como referência
- Reinicie o servidor de desenvolvimento após alterar variáveis de ambiente
