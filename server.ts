import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  // API Route: Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // API Route: Reverse Geocode endpoint
  app.get('/api/reverse-geocode', async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Missing lat/lon' });
    }
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=16`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Wrackline-App/1.0',
        },
      });
      if (!response.ok) {
        return res.status(response.status).json({ error: 'Geocoding service returned error' });
      }
      const data = await response.json();
      res.json({
        placeName: data.display_name || null,
        address: data.address || null,
      });
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      res.status(500).json({ error: 'Reverse geocode failed' });
    }
  });

  // API Route: Identify Seashell with Gemini API
  app.post('/api/identify', async (req, res) => {
    try {
      const {
        topViewBase64,
        apertureViewBase64,
        profileViewBase64,
        imageBase64,
        mimeType = 'image/jpeg',
        customApiKey
      } = req.body;

      const img1 = topViewBase64 || imageBase64;
      const img2 = apertureViewBase64;
      const img3 = profileViewBase64;

      if (!img1) {
        return res.status(400).json({ error: 'Missing image data' });
      }

      // Determine API Key priority: custom header/body key -> process.env.GEMINI_API_KEY
      const apiKey = customApiKey || req.headers['x-gemini-key'] as string || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(401).json({
          error: 'No Gemini API key found. Please enter your API key in the settings panel or set GEMINI_API_KEY in environment secrets.'
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // Extract helper for MIME and base64 cleaning
      const preparePart = (dataUrl: string, defaultMime: string) => {
        const match = dataUrl.match(/^data:(image\/\w+);base64,/);
        const mime = match ? match[1] : defaultMime;
        const clean = dataUrl.replace(/^data:image\/\w+;base64,/, '');
        return {
          inlineData: {
            mimeType: mime,
            data: clean,
          },
        };
      };

      const parts: any[] = [preparePart(img1, mimeType)];
      if (img2 && img2 !== img1) {
        parts.push(preparePart(img2, mimeType));
      }
      if (img3 && img3 !== img1 && img3 !== img2) {
        parts.push(preparePart(img3, mimeType));
      }

      const promptText = `You are an expert marine biologist, conchologist, paleontology enthusiast, and beachcombing naturalist specializing in identification of seashells, coral fragments, and shark teeth (fossilized or modern).

You may receive 2 or 3 images of the same specimen — main view, second angle/detail view, and optionally a side profile view. Use all provided views together in your visualAnalysis reasoning; if only two are provided, proceed with those.
${
  parts.length === 3
    ? '- Image 1: Main View\n- Image 2: Second Angle View\n- Image 3: Side Profile View.'
    : parts.length === 2
    ? '- Image 1: Main View\n- Image 2: Second Angle View.'
    : '- Image showing beach specimen.'
}

SPECIMEN IDENTIFICATION & CLASSIFICATION GUIDELINES:
1. FIRST, determine the specimen type:
   - "seashell": Gastropod, bivalve, scaphopod, sand dollar / sea urchin test, or other mollusk shell.
   - "coral": Stony coral (Scleractinia), soft coral axis, lace coral, or beach-worn coral fragment.
   - "sharkTooth": Fossilized or modern shark tooth (or ray tooth / fish tooth plate).
   - "other": Non-specimen debris (plain rock, sea glass, driftwood, brick, artificial trash, or non-marine object).
   Set "isValidSpecimen": true for "seashell", "coral", or "sharkTooth". If "other", set "isValidSpecimen": false.

2. TYPE-SPECIFIC ANATOMICAL INSPECTION:
   - SEASHELLS: Examine spire & whorls, aperture shape & lip, columella folds, texture/ribbing, and color.
   - CORAL: Examine branching pattern, corallite pore size/structure, radial calices, and surface texture. Note in habitatNote whether it's a reef fragment or beach-worn skeleton. Note: Most stony corals (Scleractinia) are legally protected against harvesting/collection (e.g. CITES, Florida law) — default "isProtectedSpecies": true for stony corals, providing clear details in protectedNote.
   - SHARK TEETH: Examine tooth shape (triangular, slender, curved), serrations (smooth vs coarse serrated edge), root lobes, and enamel color. Note in habitatNote whether it appears fossilized (dark/black/grey mineralized enamel/root) vs modern/recent (white/translucent enamel), including estimated epoch if fossilized (e.g. Miocene/Pliocene). Note collection legality in protectedNote (generally legal on public beaches, but restricted in protected state/national parks).

3. Record your step-by-step visual analysis in "visualAnalysis" BEFORE concluding your final identification.
4. If "isValidSpecimen" is false, summarize why in "visualAnalysis" and provide brief filler values for commonName ("Non-Specimen Object"), scientificName ("N/A"), family ("Unclassified"), confidence (0.0), and rarity ("unknown").
5. If "isValidSpecimen" is true, provide precise identification data according to the schema.
   - For "commonAliases": list up to 3 well-known colloquial, regional, or beachcomber nicknames for this species/specimen distinct from the primary commonName. Emphasize accuracy over invention — if none are commonly used, return an empty array [] rather than making one up.`;

      parts.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: {
          parts,
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              visualAnalysis: {
                type: Type.STRING,
                description: 'Describe observed anatomical features, texture, color, and size cues before concluding an ID'
              },
              specimenType: {
                type: Type.STRING,
                enum: ['seashell', 'coral', 'sharkTooth', 'other'],
                description: 'Type of beachcombing specimen detected'
              },
              isValidSpecimen: {
                type: Type.BOOLEAN,
                description: 'True if photo shows a valid seashell, coral fragment, or shark tooth; false if plain rock, glass, or non-specimen'
              },
              commonName: { type: Type.STRING, description: 'Common English name of the specimen' },
              commonAliases: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Up to 3 colloquial, regional, or beachcomber nicknames for this species/specimen, distinct from commonName. Omit if none.'
              },
              scientificName: { type: Type.STRING, description: 'Latin scientific name or genus/family classification' },
              family: { type: Type.STRING, description: 'Taxonomic family' },
              confidence: { type: Type.NUMBER, description: 'Confidence rating from 0.0 to 1.0' },
              rarity: {
                type: Type.STRING,
                enum: ['common', 'uncommon', 'rare', 'unknown'],
                description: 'Rarity level for beachcombers'
              },
              habitatNote: { type: Type.STRING, description: 'Natural habitat, fossil era/mineralization, or oceanographic distribution notes' },
              funFact: { type: Type.STRING, description: 'Fascinating marine biology, anatomical, or historical fact' },
              isProtectedSpecies: { type: Type.BOOLEAN, description: 'True if protected or restricted by conservation law' },
              protectedNote: { type: Type.STRING, description: 'Legal protection details or beachcombing harvesting rules' },
              alternateMatches: {
                type: Type.ARRAY,
                description: 'Top candidate matches if identification is uncertain',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    commonName: { type: Type.STRING },
                    scientificName: { type: Type.STRING },
                    confidence: { type: Type.NUMBER },
                    distinguishingFeature: { type: Type.STRING }
                  },
                  required: ['commonName', 'scientificName', 'confidence', 'distinguishingFeature']
                }
              }
            },
            required: [
              'visualAnalysis',
              'specimenType',
              'isValidSpecimen',
              'commonName',
              'commonAliases',
              'scientificName',
              'family',
              'confidence',
              'rarity',
              'habitatNote',
              'funFact',
              'isProtectedSpecies',
              'protectedNote'
            ]
          }
        }
      });

      const responseText = response.text || '';
      const identificationData = JSON.parse(responseText);
      if (identificationData.isValidSpecimen !== undefined && identificationData.isValidShell === undefined) {
        identificationData.isValidShell = identificationData.isValidSpecimen;
      }

      res.json({
        success: true,
        data: identificationData
      });

    } catch (err: any) {
      console.error('Gemini Shell Identification Error:', err);
      res.status(500).json({
        error: 'Failed to analyze shell specimen.',
        details: err?.message || 'An unexpected error occurred during image processing.'
      });
    }
  });

  // API Route: Find Locations for a Specimen using Google Search Grounding
  app.post('/api/find-locations', async (req, res) => {
    try {
      const { speciesName, lat, lon, customApiKey } = req.body;
      if (!speciesName || typeof speciesName !== 'string' || !speciesName.trim()) {
        return res.status(400).json({ error: 'Species or specimen name is required.' });
      }

      const apiKey = customApiKey || (req.headers['x-gemini-key'] as string) || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(401).json({
          error: 'No Gemini API key found. Please enter your API key in settings or set GEMINI_API_KEY in environment.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const userCoordinatesStr =
        lat !== undefined && lon !== undefined ? `User's current location coordinates: ${lat}° N, ${lon}° W.` : '';

      const promptText = `Target Specimen / Species: "${speciesName.trim()}"
${userCoordinatesStr}

You are an expert coastal marine biologist, oceanographer, and beachcombing naturalist guide.
Search the web for real, accurate, grounded geographic information on where beachcombers can find "${speciesName.trim()}" (seashell, coral fragment, shark tooth, or marine fossil).

Please structure your response clearly using Markdown formatting:
## Prime Beachcombing Spots for ${speciesName.trim()}
List 3 to 5 specific named beaches, islands, coastlines, or geological formations known for this specimen. ${
        lat !== undefined && lon !== undefined
          ? "Prioritize or highlight relevant spots near the user's location if geographically applicable, alongside major global or regional hotspots."
          : ''
      }
For each location, explain WHY it is known for this find, what specific area or beach section to search, and the historical or ecological reason.

## Ideal Season & Timing
Explain the best months, weather conditions (e.g., post-winter storm wash, tropical swell), and tide stages (e.g., negative low spring tide, outgoing tide).

## Substrate & Search Techniques
Detail what substrate to look in (shell hash bands, gravel bars, low-tide mudflats, shallow sandbars) and search depth/visibility tips.

## Conservation & Legal Collection Restrictions
If this species or specimen type is legally protected or restricted (e.g. live harvesting prohibitions, stony coral protection laws under CITES/state laws, state park collection limits), clearly detail those restrictions and emphasize ethical beachcombing ("take only empty shells/fossils, leave living creatures").`;

      let response;
      let isGroundedAttemptSucceeded = false;

      try {
        // Try Google Search Grounding with gemma-4-26b-a4b-it (verified working model with googleSearch tool enabled)
        response = await ai.models.generateContent({
          model: 'gemma-4-26b-a4b-it',
          contents: promptText,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });
        isGroundedAttemptSucceeded = true;
      } catch (groundingError: any) {
        console.warn('Search grounding model attempt encountered quota or tool restriction, falling back to gemini-3.6-flash model knowledge:', groundingError?.message || groundingError);
        // Fallback to standard content generation with gemini-3.6-flash if search tool quota/limits are triggered
        response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: promptText,
        });
        isGroundedAttemptSucceeded = false;
      }

      const guideText = response.text || 'No location information found.';

      // Extract grounding metadata & web search sources
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const groundingChunks = groundingMetadata?.groundingChunks || [];
      const webSearchQueries = groundingMetadata?.webSearchQueries || [];

      const isGrounded = isGroundedAttemptSucceeded && groundingChunks.length > 0;

      const sources = groundingChunks
        .map((chunk: any) => ({
          title: chunk?.web?.title || chunk?.web?.uri || 'Web Resource',
          url: chunk?.web?.uri,
        }))
        .filter((s: any) => s.url);

      const uniqueSources = sources.filter(
        (source: any, index: number, self: any[]) => index === self.findIndex((s) => s.url === source.url)
      );

      res.json({
        success: true,
        speciesName: speciesName.trim(),
        guide: guideText,
        isGrounded,
        sources: uniqueSources,
        searchQueries: webSearchQueries,
        userLocation: lat !== undefined && lon !== undefined ? { lat, lon } : null,
      });
    } catch (err: any) {
      console.error('Gemini Find Locations Error:', err);
      res.status(500).json({
        error: 'Failed to search for location guide.',
        details: err?.message || 'An unexpected error occurred during Google Search grounding.',
      });
    }
  });

  // Vite development middleware vs Static Production
  if (process.env.NODE_ENV !== 'production') {
    const publicPath = path.join(process.cwd(), 'public');
    app.use(express.static(publicPath));

    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌊 Wrackline Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
