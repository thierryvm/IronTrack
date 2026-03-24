import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'IronTrack - Ton coach muscu personnel'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0B111A',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            position: 'absolute',
            top: '-200px',
            left: '-200px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            right: '-150px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)',
          }}
        />

        {/* Logo icon */}
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '28px',
            background: '#f97316',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
            boxShadow: '0 20px 60px rgba(249,115,22,0.4)',
          }}
        >
          <svg width="72" height="72" viewBox="0 0 60 60" fill="none">
            <line x1="16" y1="30" x2="44" y2="30" stroke="white" strokeWidth="4" strokeLinecap="round"/>
            <line x1="18" y1="14" x2="18" y2="46" stroke="white" strokeWidth="4" strokeLinecap="round"/>
            <line x1="42" y1="14" x2="42" y2="46" stroke="white" strokeWidth="4" strokeLinecap="round"/>
            <line x1="10" y1="20" x2="26" y2="20" stroke="white" strokeWidth="4" strokeLinecap="round"/>
            <line x1="10" y1="40" x2="26" y2="40" stroke="white" strokeWidth="4" strokeLinecap="round"/>
            <line x1="34" y1="20" x2="50" y2="20" stroke="white" strokeWidth="4" strokeLinecap="round"/>
            <line x1="34" y1="40" x2="50" y2="40" stroke="white" strokeWidth="4" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: '80px',
            fontWeight: '800',
            letterSpacing: '-2px',
            marginBottom: '20px',
          }}
        >
          <span style={{ color: '#fafafa' }}>Iron</span>
          <span style={{ color: '#f97316' }}>Track</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '28px',
            color: '#a1a1aa',
            fontWeight: '400',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          Ton coach muscu personnel
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '4px',
            background: 'linear-gradient(90deg, transparent, #f97316, transparent)',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
