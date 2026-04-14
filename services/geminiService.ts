
import { 
  CONCEPT_DEFINITIONS, 
  KB_KEYWORDS, 
  RULES_OF_THUMB, 
  CONCEPT_TAB_MAP 
} from '../data/knowledgeBase';

/**
 * Technical Logic Engine (Deterministic)
 * Scans keywords to provide validated engineering advice using the local knowledge base.
 * No external API calls or API keys required.
 */
const getLocalExpertResponse = (message: string): string | null => {
  const query = message.toLowerCase();
  
  // Find the best matching concept based on keywords
    let bestMatch: string | null = null;
  let maxHits = 0;

  for (const [id, keywords] of Object.entries(KB_KEYWORDS)) {
    const hits = keywords.filter(k => query.includes(k.toLowerCase())).length;
    if (hits > maxHits) {
      maxHits = hits;
      bestMatch = id;
    }
  }

  if (bestMatch && maxHits > 0) {
                const title = bestMatch ? bestMatch.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase()) : '';
    const definition = CONCEPT_DEFINITIONS[bestMatch];
    const rules = RULES_OF_THUMB[bestMatch] || [];
    const section = CONCEPT_TAB_MAP[bestMatch] || 'General';

    let response = `**[Logic Core Analysis]** Found technical match for "${title}" in the ${section} module:\n\n`;
    response += `${definition}\n\n`;
    if (rules.length > 0) {
      response += `**Validated Rules of Thumb:**\n`;
      rules.forEach(r => response += `• ${r}\n`);
    }
    return response;
  }

  return null;
};

export const sendMessageToGemini = async (message: string): Promise<{ text: string, isAi: boolean }> => {
  // Directly use the local deterministic engine
  const localResponse = getLocalExpertResponse(message);

  return { 
    text: localResponse || "The engine couldn't find a high-confidence match for that specific query. Try asking about 'PAM4', 'DR4', 'FEC', 'UPC/APC', or 'SMF/MMF'.", 
    isAi: false 
  };
};
