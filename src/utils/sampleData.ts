import { SampleShell } from '../types';

// Crisp SVG data URIs for sample seashells to guarantee instant, high quality rendering
const junoniaSVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <rect width="100%" height="100%" fill="#E3DABF"/>
  <!-- Sand texture dots -->
  <circle cx="50" cy="80" r="1.5" fill="#C5B899" opacity="0.6"/>
  <circle cx="320" cy="120" r="2" fill="#C5B899" opacity="0.6"/>
  <circle cx="100" cy="340" r="1.8" fill="#C5B899" opacity="0.6"/>
  <circle cx="280" cy="300" r="1.2" fill="#C5B899" opacity="0.6"/>
  
  <!-- Shadow -->
  <ellipse cx="205" cy="285" rx="85" ry="35" fill="#16393D" opacity="0.2"/>
  
  <!-- Junonia Shell Body -->
  <g transform="translate(130, 60) rotate(12 70 120)">
    <!-- Spire -->
    <path d="M 70 10 Q 75 0 80 10 L 95 40 Q 70 45 45 40 Z" fill="#EFE8D6" stroke="#16393D" stroke-width="2"/>
    <path d="M 70 25 Q 75 20 80 25 L 90 42 Q 70 46 50 42 Z" fill="#DECFA6" stroke="#16393D" stroke-width="1.5"/>
    
    <!-- Body Whorl -->
    <path d="M 45 40 Q 15 80 20 150 Q 30 220 70 250 Q 110 220 125 150 Q 130 80 95 40 Z" fill="#FDFBF7" stroke="#16393D" stroke-width="2.5"/>
    <path d="M 30 110 Q 70 120 120 105 Q 122 150 110 190 Q 70 240 70 248 Q 40 210 25 150 Z" fill="#F4EEDD"/>
    
    <!-- Aperture line -->
    <path d="M 70 250 C 95 210 110 160 100 100 Q 115 140 108 200 Z" fill="#E8D2C0" stroke="#16393D" stroke-width="1.5"/>
    
    <!-- Junonia Characteristic Brown Spots Rows -->
    <g fill="#7A3B18" stroke="#4A200B" stroke-width="0.5">
      <!-- Row 1 -->
      <rect x="55" y="60" width="10" height="7" rx="1"/>
      <rect x="72" y="60" width="10" height="7" rx="1"/>
      <!-- Row 2 -->
      <rect x="42" y="80" width="11" height="8" rx="1"/>
      <rect x="62" y="81" width="12" height="8" rx="1"/>
      <rect x="83" y="80" width="11" height="8" rx="1"/>
      <!-- Row 3 -->
      <rect x="35" y="105" width="12" height="9" rx="1"/>
      <rect x="57" y="106" width="13" height="9" rx="1"/>
      <rect x="80" y="106" width="13" height="9" rx="1"/>
      <rect x="101" y="105" width="10" height="9" rx="1"/>
      <!-- Row 4 -->
      <rect x="30" y="135" width="13" height="10" rx="1"/>
      <rect x="54" y="136" width="14" height="10" rx="1"/>
      <rect x="78" y="136" width="14" height="10" rx="1"/>
      <rect x="102" y="135" width="12" height="10" rx="1"/>
      <!-- Row 5 -->
      <rect x="32" y="165" width="12" height="9" rx="1"/>
      <rect x="55" y="166" width="14" height="9" rx="1"/>
      <rect x="78" y="166" width="14" height="9" rx="1"/>
      <rect x="100" y="165" width="11" height="9" rx="1"/>
      <!-- Row 6 -->
      <rect x="40" y="195" width="11" height="8" rx="1"/>
      <rect x="59" y="196" width="12" height="8" rx="1"/>
      <rect x="79" y="196" width="12" height="8" rx="1"/>
      <!-- Row 7 -->
      <rect x="52" y="222" width="10" height="7" rx="1"/>
      <rect x="68" y="222" width="10" height="7" rx="1"/>
    </g>
  </g>
  <!-- Label tag overlay -->
  <rect x="15" y="15" width="120" height="24" rx="3" fill="#FAF6ED" stroke="#16393D" stroke-dasharray="3 3"/>
  <text x="23" y="31" font-family="serif" font-size="11" font-weight="bold" fill="#16393D">SPECIMEN #01</text>
</svg>
`)}`;

const queenConchSVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <rect width="100%" height="100%" fill="#E8DEC4"/>
  
  <!-- Shadow -->
  <ellipse cx="210" cy="300" rx="100" ry="40" fill="#16393D" opacity="0.2"/>
  
  <!-- Queen Conch Body -->
  <g transform="translate(60, 40)">
    <!-- Spire with Spines -->
    <path d="M 120 20 L 135 60 L 170 80 L 120 70 L 80 85 L 105 55 Z" fill="#EADBC8" stroke="#16393D" stroke-width="2"/>
    <path d="M 125 10 Q 130 0 135 10 L 145 35 L 120 30 L 100 40 Z" fill="#D8C3A8" stroke="#16393D" stroke-width="1.5"/>
    
    <!-- Big Crown Spines -->
    <path d="M 60 100 L 40 70 L 85 95 Z" fill="#E6CEB3" stroke="#16393D" stroke-width="2"/>
    <path d="M 100 85 L 105 45 L 130 80 Z" fill="#E6CEB3" stroke="#16393D" stroke-width="2"/>
    <path d="M 155 80 L 175 45 L 180 90 Z" fill="#E6CEB3" stroke="#16393D" stroke-width="2"/>
    <path d="M 200 95 L 230 70 L 215 110 Z" fill="#E6CEB3" stroke="#16393D" stroke-width="2"/>
    
    <!-- Main Body Shell Outer -->
    <path d="M 60 100 Q 30 180 80 260 Q 110 300 140 280 Q 280 240 260 130 Q 240 90 200 95 Z" fill="#E3CDA9" stroke="#16393D" stroke-width="2.5"/>
    
    <!-- Spectacular Pink Flared Aperture Lip -->
    <path d="M 120 120 C 180 110 270 125 275 180 C 280 230 220 270 140 280 C 100 285 105 200 120 120 Z" fill="#E08B9B" stroke="#16393D" stroke-width="2"/>
    <path d="M 135 135 C 190 125 255 140 258 185 C 260 220 210 255 145 262 C 120 265 125 190 135 135 Z" fill="#F4B2C1" opacity="0.85"/>
    <path d="M 150 150 C 195 142 240 155 242 188 C 244 210 200 240 155 245 Z" fill="#FDE1E7" opacity="0.9"/>
    
    <!-- Spiral Ridge Lines -->
    <path d="M 75 130 Q 100 145 120 140" fill="none" stroke="#B89B77" stroke-width="2"/>
    <path d="M 70 160 Q 95 175 120 165" fill="none" stroke="#B89B77" stroke-width="2"/>
    <path d="M 72 190 Q 95 205 125 195" fill="none" stroke="#B89B77" stroke-width="2"/>
  </g>
  
  <!-- Warning Banner Stamp -->
  <g transform="translate(20, 330)">
    <rect width="180" height="32" rx="4" fill="#D98C93" stroke="#16393D" stroke-width="1.5"/>
    <text x="12" y="21" font-family="sans-serif" font-size="11" font-weight="bold" fill="#FFFFFF">⚠️ PROTECTED SPECIES</text>
  </g>
</svg>
`)}`;

const calicoScallopSVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <rect width="100%" height="100%" fill="#E3DABF"/>
  
  <!-- Shadow -->
  <ellipse cx="200" cy="320" rx="100" ry="25" fill="#16393D" opacity="0.2"/>
  
  <g transform="translate(200, 200)">
    <!-- Scallop Ears / Hinge -->
    <path d="M -60 70 L -75 110 L 75 110 L 60 70 Z" fill="#D9A87E" stroke="#16393D" stroke-width="2"/>
    <path d="M -50 80 L -62 105 L 62 105 L 50 80 Z" fill="#8FBBAA" opacity="0.6"/>
    
    <!-- Fan Fan Body -->
    <path d="M 0 90 C -130 80 -170 -30 -120 -100 C -70 -160 70 -160 120 -100 C 170 -30 130 80 0 90 Z" fill="#F5EFE0" stroke="#16393D" stroke-width="2.5"/>
    
    <!-- Radial Ribs (20+ ribs) -->
    <g fill="none" stroke="#16393D" stroke-width="1.5">
      <path d="M 0 85 Q -10 0 0 -150"/>
      <path d="M 0 85 Q -25 0 -25 -148"/>
      <path d="M 0 85 Q 25 0 25 -148"/>
      <path d="M 0 85 Q -50 5 -50 -142"/>
      <path d="M 0 85 Q 50 5 50 -142"/>
      <path d="M 0 85 Q -75 15 -75 -130"/>
      <path d="M 0 85 Q 75 15 75 -130"/>
      <path d="M 0 85 Q -98 30 -100 -112"/>
      <path d="M 0 85 Q 98 30 100 -112"/>
      <path d="M 0 85 Q -120 50 -120 -85"/>
      <path d="M 0 85 Q 120 50 120 -85"/>
    </g>
    
    <!-- Calico Pink Mottled Pattern Spots -->
    <g fill="#D98C93" opacity="0.8">
      <ellipse cx="-40" cy="-60" rx="15" ry="8" transform="rotate(-20 -40 -60)"/>
      <ellipse cx="30" cy="-80" rx="18" ry="10" transform="rotate(15 30 -80)"/>
      <ellipse cx="0" cy="-110" rx="12" ry="6"/>
      <ellipse cx="-70" cy="-20" rx="20" ry="9" transform="rotate(-40 -70 -20)"/>
      <ellipse cx="65" cy="-25" rx="16" ry="8" transform="rotate(35 65 -25)"/>
      <ellipse cx="-20" cy="10" rx="22" ry="10" transform="rotate(-10 -20 10)"/>
      <ellipse cx="40" cy="20" rx="15" ry="7" transform="rotate(20 40 20)"/>
      <ellipse cx="-80" cy="30" rx="14" ry="7"/>
    </g>
  </g>
  <!-- Tag Stamp -->
  <rect x="270" y="20" width="110" height="24" fill="#8FBBAA" stroke="#16393D" rx="3"/>
  <text x="282" y="36" font-family="sans-serif" font-size="10" font-weight="bold" fill="#16393D">COMMON FIND</text>
</svg>
`)}`;

const sandDollarSVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <rect width="100%" height="100%" fill="#E3DABF"/>
  
  <!-- Shadow -->
  <ellipse cx="200" cy="210" rx="125" ry="115" fill="#16393D" opacity="0.18"/>
  
  <!-- Flattened Test Disc -->
  <ellipse cx="200" cy="200" rx="130" ry="120" fill="#F8F5EC" stroke="#16393D" stroke-width="2.5"/>
  <ellipse cx="200" cy="200" rx="120" ry="110" fill="#EFEAD9" opacity="0.5"/>
  
  <!-- 5 Lunules (Keyhole slots) -->
  <g fill="#16393D" opacity="0.8">
    <!-- Top Lunule -->
    <ellipse cx="200" cy="115" rx="7" ry="18"/>
    <!-- Upper Left -->
    <ellipse cx="130" cy="150" rx="7" ry="18" transform="rotate(-35 130 150)"/>
    <!-- Upper Right -->
    <ellipse cx="270" cy="150" rx="7" ry="18" transform="rotate(35 270 150)"/>
    <!-- Lower Left -->
    <ellipse cx="145" cy="245" rx="7" ry="18" transform="rotate(-70 145 245)"/>
    <!-- Lower Right -->
    <ellipse cx="255" cy="245" rx="7" ry="18" transform="rotate(70 255 245)"/>
  </g>
  
  <!-- 5 Petal Pattern (Star shape) -->
  <g fill="#A8987B" stroke="#16393D" stroke-width="1.2" opacity="0.85">
    <!-- Top Petal -->
    <path d="M 200 200 C 185 170 185 130 200 110 C 215 130 215 170 200 200 Z"/>
    <!-- Top Right -->
    <path d="M 200 200 C 225 180 260 170 275 190 C 260 210 220 210 200 200 Z"/>
    <!-- Bottom Right -->
    <path d="M 200 200 C 220 220 240 255 225 270 C 205 260 200 225 200 200 Z"/>
    <!-- Bottom Left -->
    <path d="M 200 200 C 180 220 160 255 175 270 C 195 260 200 225 200 200 Z"/>
    <!-- Top Left -->
    <path d="M 200 200 C 175 180 140 170 125 190 C 140 210 180 210 200 200 Z"/>
  </g>

  <!-- Pores & Texture -->
  <circle cx="200" cy="200" r="4" fill="#16393D"/>
  <circle cx="200" cy="200" r="1" fill="#FFFFFF"/>
</svg>
`)}`;

export const SAMPLE_SHELLS: SampleShell[] = [
  {
    id: 'sample-junonia',
    commonName: 'Junonia Volute',
    scientificName: 'Scaphella junonia',
    image: junoniaSVG,
    category: 'Volute / Holy Grail Shell',
    sampleData: {
      commonName: 'Junonia Volute',
      scientificName: 'Scaphella junonia',
      family: 'Volutidae',
      confidence: 0.96,
      rarity: 'rare',
      habitatNote: 'Inhabits deep offshore waters (40 to 180 feet) from North Carolina to the Gulf of Mexico. Highly prized by beachcombers on Sanibel Island when washed ashore following major winter storms or hurricanes.',
      funFact: 'Finding an intact Junonia on the beach is considered the ultimate prize for Gulf Coast shell collectors! Sanibel Island newspapers historically published photos of lucky beachcombers who found one.',
      isProtectedSpecies: false,
      protectedNote: 'Unprotected species, but live specimens should be returned to the water to conserve deep-water breeding populations.',
      alternateMatches: [
        {
          commonName: 'Band Tulip',
          scientificName: 'Cinctura hunteria',
          confidence: 0.12,
          distinguishingFeature: 'Lacks distinct square brown spot rows; features thin unbroken spiral lines instead.'
        }
      ]
    }
  },
  {
    id: 'sample-queen-conch',
    commonName: 'Queen Conch',
    scientificName: 'Aliger gigas',
    image: queenConchSVG,
    category: 'Large Gastropod',
    sampleData: {
      commonName: 'Queen Conch',
      scientificName: 'Aliger gigas',
      family: 'Strombidae',
      confidence: 0.98,
      rarity: 'uncommon',
      habitatNote: 'Native to shallow seagrass beds and warm coral reef lagoons throughout the Caribbean and Florida Keys. Feeds primarily on benthic algae and detritus.',
      funFact: 'Queen Conchs can live for up to 40 years and produce glorious pink pearls! They move in a distinctive "hopping" motion using their claw-like operculum as a lever.',
      isProtectedSpecies: true,
      protectedNote: '⚠️ RESTRICTED SPECIES: Protected under Florida Administrative Code and US Federal Wildlife laws. Harvesting live Queen Conch in Florida or US waters is strictly illegal and subject to severe penalties.',
      alternateMatches: [
        {
          commonName: 'Milk Conch',
          scientificName: 'Macrostrombus costatus',
          confidence: 0.08,
          distinguishingFeature: 'Smaller with a thicker, milky-white interior aperture lip rather than vibrant pink.'
        }
      ]
    }
  },
  {
    id: 'sample-calico-scallop',
    commonName: 'Calico Scallop',
    scientificName: 'Argopecten gibbus',
    image: calicoScallopSVG,
    category: 'Bivalve Fan Shell',
    sampleData: {
      commonName: 'Calico Scallop',
      scientificName: 'Argopecten gibbus',
      family: 'Pectinidae',
      confidence: 0.94,
      rarity: 'common',
      habitatNote: 'Abundant in coastal waters along the Atlantic coast from North Carolina down through the Caribbean. Found in sandy bay bottoms and swept onto ocean beaches.',
      funFact: 'Calico Scallops have dozens of tiny, bright blue eyes arranged along the edge of their mantle that detect light and movement! They can swim rapidly by clapping their shell valves together.',
      isProtectedSpecies: false,
      protectedNote: 'Abundant shell species. Empty shell valves are safe and legal to collect in reasonable quantities.',
      alternateMatches: [
        {
          commonName: 'Bay Scallop',
          scientificName: 'Argopecten irradians',
          confidence: 0.15,
          distinguishingFeature: 'Bay Scallops typically have darker gray or drab brown mottling with squarer ribs.'
        }
      ]
    }
  },
  {
    id: 'sample-sand-dollar',
    commonName: 'Keyhole Sand Dollar',
    scientificName: 'Mellita quinquiesperforata',
    image: sandDollarSVG,
    category: 'Echinoderm / Sea Urchin relative',
    sampleData: {
      commonName: 'Keyhole Sand Dollar',
      scientificName: 'Mellita quinquiesperforata',
      family: 'Mellitidae',
      confidence: 0.91,
      rarity: 'common',
      habitatNote: 'Burrows shallowly under sandy sea bottoms along calm Atlantic and Gulf coastlines. The 5 narrow slots (lunules) reduce hydrodynamic lift from surf waves so it stays anchored.',
      funFact: 'When alive, sand dollars are covered in tiny purple-brown velvety spines and cilia. The smooth white "dollar" found on the beach is the bleached internal skeleton (test).',
      isProtectedSpecies: false,
      protectedNote: 'Bleached white empty tests are legal to collect. Live dark/velvety specimens are protected by coastal marine life regulations and must be left in the water!',
      alternateMatches: [
        {
          commonName: 'Six-Hole Sand Dollar',
          scientificName: 'Leodia sexiesperforata',
          confidence: 0.18,
          distinguishingFeature: 'Has 6 narrow keyhole slots instead of 5, found more frequently in tropical Caribbean beaches.'
        }
      ]
    }
  }
];
