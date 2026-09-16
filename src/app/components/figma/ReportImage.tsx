import React from 'react'
import { ImageWithFallback } from './ImageWithFallback'

// Image locale générée en SVG (aucun CDN : fonctionne hors-ligne).
// Utilisée quand un signalement n'a pas (encore) de photo.
const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e2e8f0"/>
      <stop offset="1" stop-color="#bae6fd"/>
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#g)"/>
  <path d="M0 240 Q100 210 200 240 T400 240 V300 H0 Z" fill="#0ea5e9" opacity="0.15"/>
  <rect x="120" y="150" width="160" height="90" rx="8" fill="#ffffff" opacity="0.7"/>
  <path d="M120 195 H280 M120 225 Q170 200 280 225 Z" fill="#0ea5e9" opacity="0.5"/>
  <circle cx="200" cy="105" r="30" fill="none" stroke="#64748b" stroke-width="7"/>
  <path d="M200 132 V210" stroke="#64748b" stroke-width="7" stroke-linecap="round"/>
  <circle cx="200" cy="105" r="12" fill="#ef4444"/>
  <circle cx="200" cy="105" r="26" fill="#ffffff" opacity="0.4"/>
  <rect x="60" y="255" width="90" height="9" rx="4.5" fill="#94a3b8" opacity="0.6"/>
  <rect x="250" y="255" width="90" height="9" rx="4.5" fill="#94a3b8" opacity="0.6"/>
</svg>`

export const REPORT_PLACEHOLDER_IMG = `data:image/svg+xml;utf8,${encodeURIComponent(PLACEHOLDER_SVG)}`

// Une image est affichable seulement si elle est publique et accessible par
// le navigateur : http(s), data:, blob: (aperçu local) ou un chemin relatif web.
//
// Les chemins locaux du téléphone (stockés en base par l'app Flutter) comme
//   /data/user/0/com.example.signci/cache/scaled_*.jpg
//   /storage/emulated/0/DCIM/...
//   file:///..., content://...
// ne sont PAS accessibles depuis le navigateur web admin → visuel local.
export const isDisplayableImage = (src?: string) =>
  !!src && (/^(https?:\/\/|data:|blob:|\/assets\/|\/images\/)/i.test(src))

// Affiche toujours une image : la photo si elle est accessible,
// sinon le visuel local (placeholder SVG).
export function ReportImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const { src, alt, ...rest } = props
  const safeSrc = isDisplayableImage(src) ? src : REPORT_PLACEHOLDER_IMG
  return <ImageWithFallback {...rest} src={safeSrc || REPORT_PLACEHOLDER_IMG} alt={alt || 'Signalement'} />
}

export default ReportImage