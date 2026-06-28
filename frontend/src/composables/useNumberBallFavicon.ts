type NumberBallFavicon = {
  ballColor: string
  text: string
  textColor: string
}

export const DEFAULT_NUMBER_BALL_FAVICON = {
  ballColor: '#9b63e6',
  text: '36',
  textColor: '#ffffff',
} satisfies NumberBallFavicon

let faviconUpdateId = 0

export function updateNumberBallFavicon({ ballColor, text, textColor }: NumberBallFavicon) {
  faviconUpdateId += 1

  let icon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]')
  if (!icon) {
    icon = document.createElement('link')
    icon.rel = 'icon'
    document.head.append(icon)
  }

  icon.type = 'image/svg+xml'
  icon.href = createNumberBallFaviconDataUrl({ ballColor, text, textColor })
}

function createNumberBallFaviconDataUrl({ ballColor, text, textColor }: NumberBallFavicon) {
  const fontSize = text.length >= 2 ? 26 : 32
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<circle cx="32" cy="32" r="29" fill="${escapeSvgAttribute(ballColor)}"/>
<text x="32" y="33" fill="${escapeSvgAttribute(textColor)}" font-family="system-ui, sans-serif" font-size="${fontSize}" font-weight="900" text-anchor="middle" dominant-baseline="middle">${escapeSvgText(text)}</text>
</svg>`

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function escapeSvgAttribute(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')
}

function escapeSvgText(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}
