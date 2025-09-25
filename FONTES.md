# Guia de Fontes - CT One

## Fontes Disponíveis

A aplicação agora utiliza as fontes personalizadas disponíveis na pasta `src/assets/fonts/`.

### Montserrat (Fonte Principal)

- **font-montserrat**: Montserrat Regular
- **font-montserrat-light**: Montserrat Light
- **font-montserrat-medium**: Montserrat Medium
- **font-montserrat-bold**: Montserrat Bold
- **font-montserrat-semibold**: Montserrat SemiBold
- **font-montserrat-extrabold**: Montserrat ExtraBold

### Nexa (Fonte Secundária)

- **font-nexa**: Nexa (Light + Bold)
- **font-nexa-light**: Nexa Light
- **font-nexa-bold**: Nexa Bold

## Como Usar

### Classes Tailwind CSS

```html
<!-- Títulos principais -->
<h1 class="font-nexa-bold text-2xl">Título Principal</h1>

<!-- Subtítulos -->
<h2 class="font-montserrat-medium text-xl">Subtítulo</h2>

<!-- Texto normal -->
<p class="font-montserrat">Texto do parágrafo</p>

<!-- Texto em negrito -->
<span class="font-montserrat-bold">Texto em negrito</span>
```

### CSS Customizado

```css
.titulo-principal {
  font-family: "NexaBold", sans-serif;
}

.subtitulo {
  font-family: "Montserrat-Medium", sans-serif;
}

.texto-normal {
  font-family: "Montserrat", sans-serif;
}
```

## Configuração Padrão

- **Fonte padrão da aplicação**: Montserrat Regular
- **Aplicada automaticamente** em todos os elementos base (body, h1-h4, p, label, button, input)
- **Fallback**: sans-serif (caso as fontes personalizadas não carreguem)
- **Performance**: `font-display: swap` configurado para melhor experiência de carregamento

## Exemplos de Uso na Aplicação

1. **Título principal**: `font-nexa-bold` (ex: "CT One - Gestão ClinicaTech")
2. **Subtítulos de seção**: `font-montserrat-medium` (ex: "Visão Geral")
3. **Texto padrão**: Montserrat Regular (aplicado automaticamente)
4. **Botões e labels**: Montserrat Regular (aplicado automaticamente)

## Performance e Otimização

### font-display: swap

Todas as fontes estão configuradas com `font-display: swap` para melhor performance:

```css
@font-face {
  font-family: "Montserrat";
  src: url("./Montserrat-Regular.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
  font-display: swap; /* ← Otimização de performance */
}
```

**Benefícios:**

- ✅ Texto visível imediatamente com fonte de fallback
- ✅ Evita "flash of invisible text" (FOIT)
- ✅ Melhora a experiência do usuário
- ✅ Reduz o tempo percebido de carregamento

### Estratégia de Carregamento

1. **Imediato**: Fonte de fallback (sans-serif) é exibida
2. **Carregamento**: Fonte personalizada é baixada em background
3. **Swap**: Fonte personalizada substitui a fallback quando pronta

## Arquivos de Configuração

- **Fontes importadas**: `src/styles/globals.css`
- **Configuração Tailwind**: `tailwind.config.js`
- **Arquivos de fonte**: `src/assets/fonts/`
- **Definições @font-face**: `src/assets/fonts/*/index.css`
