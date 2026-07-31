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

  // API Route: Identify Seashell with Gemini API
  app.post('/api/identify', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg', customApiKey } = req.body;

      if (!imageBase64) {
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

      // Clean base64 string if data URL prefix exists
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const imagePart = {
        inlineData: {
          mimeType: mimeType,
          data: cleanBase64,
        },
      };

      const promptText = `You are an expert marine biologist, conchologist, and beachcombing naturalist specializing in seashell identification and marine mollusk taxonomy.
Analyze this photo of a seashell or coastal beach specimen. Identify it as precisely as possible.

Return structured JSON according to the schema:
- commonName: General English common name (e.g., "Junonia Volute", "Calico Scallop", "Queen Conch", "Sand Dollar")
- scientificName: Latin binomial species name in proper binomial nomenclature (e.g., "Scaphella junonia", "Argopecten gibbus")
- family: Taxonomic family name (e.g., "Volutidae", "Pectinidae", "Strombidae")
- confidence: Estimated identification confidence from 0.0 to 1.0 based on visible visual features
- rarity: One of ["common", "uncommon", "rare", "unknown"]. High value, hard-to-find beach shells like Junonia or intact Lion's Paw are "rare".
- habitatNote: A concise 2-3 sentence field guide note describing where this species lives, depth, geography (e.g., Atlantic, Gulf coast, Pacific, Caribbean), and typical beach drift behavior.
- funFact: A captivating 2-3 sentence biological, historical, or ecological fact about the organism.
- isProtectedSpecies: Boolean true if this species or its harvest/collection is legally protected, endangered, restricted, or prohibited under wildlife/conservation regulations (e.g. Queen Conch in FL/US, Giant Clams, Sea Turtle carapaces, live sand dollars, live coral).
- protectedNote: Detailed warning text if isProtectedSpecies is true (e.g. "⚠️ RESTRICTED SPECIES: Protected under Florida State regulations. Taking live Queen Conch specimens is strictly prohibited with severe fines."), or a brief conservation note if false.
- alternateMatches: Array of up to 3 candidate species if there is ambiguity or if confidence is lower than 0.85, each containing commonName, scientificName, confidence (0-1), and distinguishingFeature (brief explanation of how to tell it apart).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: {
          parts: [
            imagePart,
            { text: promptText }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              commonName: { type: Type.STRING, description: 'Common English name of the shell' },
              scientificName: { type: Type.STRING, description: 'Latin scientific species name' },
              family: { type: Type.STRING, description: 'Taxonomic family' },
              confidence: { type: Type.NUMBER, description: 'Confidence rating from 0.0 to 1.0' },
              rarity: {
                type: Type.STRING,
                enum: ['common', 'uncommon', 'rare', 'unknown'],
                description: 'Rarity level for beachcombers'
              },
              habitatNote: { type: Type.STRING, description: 'Natural habitat and geographic distribution notes' },
              funFact: { type: Type.STRING, description: 'Fascinating marine biology or historical fact' },
              isProtectedSpecies: { type: Type.BOOLEAN, description: 'True if protected or restricted by law' },
              protectedNote: { type: Type.STRING, description: 'Legal protection details or conservation guidance' },
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
              'commonName',
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

  // Vite development middleware vs Static Production
  if (process.env.NODE_ENV !== 'production') {
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
