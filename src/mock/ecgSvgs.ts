// Realistic simulated 12-lead ECG traces as high-resolution SVGs encoded as Data URLs
// This allows offline viewing, crystal clear zooming, and high contrast testing

export function generateEcgSvgDataUrl(type: 'stemi' | 'normal' | 'avblock'): string {
  let wavePath = '';

  if (type === 'stemi') {
    // ST elevation pattern: P, PR, Q, R, high ST plateau, T
    wavePath = `
      M 0 100 L 20 100 
      Q 27 90, 35 100 
      L 45 100 
      L 48 108 L 54 20 L 60 115 
      L 65 70 Q 90 70, 110 95 L 130 100
      L 150 100 
      Q 157 90, 165 100 
      L 175 100 
      L 178 108 L 184 20 L 190 115 
      L 195 70 Q 220 70, 240 95 L 260 100
      L 280 100
      Q 287 90, 295 100
      L 305 100
      L 308 108 L 314 20 L 320 115
      L 325 70 Q 350 70, 370 95 L 390 100
      L 410 100
      Q 417 90, 425 100
      L 435 100
      L 438 108 L 444 20 L 450 115
      L 455 70 Q 480 70, 500 95 L 520 100
      L 540 100
      Q 547 90, 555 100
      L 565 100
      L 568 108 L 574 20 L 580 115
      L 585 70 Q 610 70, 630 95 L 650 100
    `;
  } else if (type === 'avblock') {
    // Complete AV block: dissociated P waves and slow wide QRS escape rhythm
    wavePath = `
      M 0 100 L 30 100
      Q 38 88, 45 100 L 90 100
      Q 98 88, 105 100 L 140 100
      L 145 110 L 155 35 L 170 120 L 180 100
      Q 200 80, 225 100 L 250 100
      Q 258 88, 265 100 L 310 100
      Q 318 88, 325 100 L 360 100
      L 365 110 L 375 35 L 390 120 L 400 100
      Q 420 80, 445 100 L 470 100
      Q 478 88, 485 100 L 530 100
      Q 538 88, 545 100 L 580 100
      L 585 110 L 595 35 L 610 120 L 620 100
      Q 640 80, 665 100 L 700 100
    `;
  } else {
    // Normal sinus rhythm
    wavePath = `
      M 0 100 L 25 100
      Q 32 90, 40 100 L 52 100
      L 55 105 L 60 25 L 66 112 L 72 100
      Q 88 82, 104 100 L 140 100
      Q 147 90, 155 100 L 167 100
      L 170 105 L 175 25 L 181 112 L 187 100
      Q 203 82, 219 100 L 255 100
      Q 262 90, 270 100 L 282 100
      L 285 105 L 290 25 L 296 112 L 302 100
      Q 318 82, 334 100 L 370 100
      Q 377 90, 385 100 L 397 100
      L 400 105 L 405 25 L 411 112 L 417 100
      Q 433 82, 449 100 L 485 100
      Q 492 90, 500 100 L 512 100
      L 515 105 L 520 25 L 526 112 L 532 100
      Q 548 82, 564 100 L 600 100
    `;
  }

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 240" width="800" height="240">
    <defs>
      <!-- Small 1mm grid -->
      <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#fca5a5" stroke-width="0.5" stroke-opacity="0.45" />
      </pattern>
      <!-- Big 5mm grid -->
      <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
        <rect width="50" height="50" fill="url(#smallGrid)" />
        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#ef4444" stroke-width="1.2" stroke-opacity="0.6" />
      </pattern>
    </defs>
    
    <!-- ECG Paper background -->
    <rect width="100%" height="100%" fill="#fffaf5" />
    <rect width="100%" height="100%" fill="url(#grid)" />
    
    <!-- Calibration pulse -->
    <path d="M 10 100 L 20 100 L 20 50 L 35 50 L 35 100 L 45 100" fill="none" stroke="#0f172a" stroke-width="1.8" />
    
    <!-- ECG Trace -->
    <g transform="translate(45, 0)">
      <path d="${wavePath}" fill="none" stroke="#090d16" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" />
    </g>
    
    <!-- Lead annotation -->
    <text x="20" y="25" font-family="monospace" font-size="14" font-weight="bold" fill="#7f1d1d">DII / V2 - 25mm/s 10mm/mV</text>
  </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
