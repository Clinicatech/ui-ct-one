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

## Exemplos de Uso na Aplicação

1. **Título principal**: `font-nexa-bold` (ex: "CT One - Gestão ClinicaTech")
2. **Subtítulos de seção**: `font-montserrat-medium` (ex: "Visão Geral")
3. **Texto padrão**: Montserrat Regular (aplicado automaticamente)
4. **Botões e labels**: Montserrat Regular (aplicado automaticamente)

## Arquivos de Configuração

- **Fontes importadas**: `src/styles/globals.css`
- **Configuração Tailwind**: `tailwind.config.js`
- **Arquivos de fonte**: `src/assets/fonts/`
