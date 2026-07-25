import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt =
  'unlocalhost, turn localhost into a link only your friends can open';

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: '#0b0f16',
        color: '#e8edf4',
        padding: '86px',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: 22,
          letterSpacing: 4,
          textTransform: 'uppercase',
          color: '#8b98a8',
          marginBottom: 34,
        }}
      >
        open source
      </div>

      <div
        style={{
          display: 'flex',
          fontSize: 92,
          fontWeight: 700,
          letterSpacing: -3,
        }}
      >
        un
        <span style={{ color: '#4d93f0' }}>localhost</span>
        <span style={{ marginLeft: 22 }}>your app</span>
      </div>

      <div
        style={{
          display: 'flex',
          fontSize: 31,
          color: '#8b98a8',
          marginTop: 26,
          maxWidth: 900,
          lineHeight: 1.4,
        }}
      >
        Your agent can build the whole thing. It still cannot host it.
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 22,
          marginTop: 60,
        }}
      >
        <div
          style={{
            display: 'flex',
            padding: '14px 26px',
            border: '2px dashed #2e3b4b',
            borderRadius: 999,
            fontSize: 25,
            color: '#8b98a8',
          }}
        >
          localhost:3000
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: '#4d93f0' }}>
          &#8594;
        </div>
        <div
          style={{
            display: 'flex',
            padding: '14px 26px',
            border: '2px solid #4d93f0',
            borderRadius: 999,
            fontSize: 25,
          }}
        >
          a link with a guest list
        </div>
      </div>
    </div>,
    size,
  );
}
