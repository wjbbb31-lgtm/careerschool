import { BookDataSnapshot } from '../components/ui/BookPages';
import {
  getTopHollandCode,
  HOLLAND_META,
  SERENDIPITY_ATTITUDES,
  SERENDIPITY_CARDS,
} from '../data/chapters';

export const SHEETDB_API_URL = 'https://sheetdb.io/api/v1/wu3p5bz10mwzk';

export interface SheetRowPayload {
  created_at: string;
  class_code: string;
  nickname: string;
  holland_code: string;
  holland_scores: string;
  interest_sentence: string;
  s_situation: string;
  s_self: string;
  s_support: string;
  s_strategy: string;
  chance_event: string;
  chance_attitude: string;
  chance_answer: string;
  book_title: string;
  first_sentence: string;
  letter: string;
  share_ok: 'Y' | 'N';
}

export function formatHollandScoresString(scores: BookDataSnapshot['hollandScores']): string {
  return HOLLAND_META.map((item) => `${item.code}:${scores[item.id] ?? 3}`).join(',');
}

export function buildSheetRowPayload(data: BookDataSnapshot): SheetRowPayload {
  const hollandCode = getTopHollandCode(data.hollandScores).replace(/\s*·\s*/g, '');
  const card = SERENDIPITY_CARDS.find((c) => c.id === data.ch3State.cardId);
  const attitude = SERENDIPITY_ATTITUDES.find((a) => a.id === data.ch3State.attitudeId);

  return {
    created_at: new Date().toISOString(),
    class_code: (data.profile.classCode || '').trim().toUpperCase(),
    nickname: data.profile.nickname,
    holland_code: hollandCode,
    holland_scores: formatHollandScoresString(data.hollandScores),
    interest_sentence: data.interestWriting || '',
    s_situation: data.fourS.situation || '',
    s_self: data.fourS.self || '',
    s_support: data.fourS.support || '',
    s_strategy: data.fourS.strategy || '',
    chance_event: card?.text || '',
    chance_attitude: attitude?.name || '',
    chance_answer: data.ch3Writing || '',
    book_title: data.ch4State.bookTitle || '',
    first_sentence: data.ch4State.firstSentence || '',
    letter: data.ch4State.letterSkipped ? '' : data.ch4State.letter || '',
    share_ok: data.ch4State.allowPublicShare ? 'Y' : 'N',
  };
}

export function computeSubmissionDigest(row: Omit<SheetRowPayload, 'created_at'>): string {
  return JSON.stringify(row);
}

export async function postBookToSheetDB(
  payload: SheetRowPayload,
): Promise<{ ok: boolean }> {
  try {
    const response = await fetch(SHEETDB_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: [payload] }),
    });

    if (!response.ok) {
      console.error(`SheetDB POST failed with status ${response.status}`);
      return { ok: false };
    }

    return { ok: true };
  } catch (error) {
    console.error('SheetDB POST network error:', error);
    return { ok: false };
  }
}

export async function fetchClassBooksFromSheetDB(
  classCode: string,
): Promise<{ ok: boolean; rows: SheetRowPayload[] }> {
  const cleanCode = classCode.trim().toUpperCase();
  const url = `${SHEETDB_API_URL}/search?class_code=${encodeURIComponent(cleanCode)}`;

  try {
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) {
      console.error(`SheetDB GET failed with status ${response.status}`);
      return { ok: false, rows: [] };
    }

    const json = (await response.json()) as unknown;
    if (!Array.isArray(json)) {
      return { ok: true, rows: [] };
    }

    // Deduplicate by nickname: keep only the most recent row per student
    const latestByNickname = new Map<string, SheetRowPayload>();
    for (const rawRow of json) {
      const row = rawRow as Partial<SheetRowPayload>;
      const nick = (row.nickname || '').trim();
      if (!nick) continue;

      const normalizedRow: SheetRowPayload = {
        created_at: String(row.created_at || ''),
        class_code: String(row.class_code || ''),
        nickname: nick,
        holland_code: String(row.holland_code || 'AIS'),
        holland_scores: String(row.holland_scores || ''),
        interest_sentence: String(row.interest_sentence || ''),
        s_situation: String(row.s_situation || ''),
        s_self: String(row.s_self || ''),
        s_support: String(row.s_support || ''),
        s_strategy: String(row.s_strategy || ''),
        chance_event: String(row.chance_event || ''),
        chance_attitude: String(row.chance_attitude || ''),
        chance_answer: String(row.chance_answer || ''),
        book_title: String(row.book_title || ''),
        first_sentence: String(row.first_sentence || ''),
        letter: String(row.letter || ''),
        share_ok: String(row.share_ok).toUpperCase() === 'Y' ? 'Y' : 'N',
      };

      const existing = latestByNickname.get(nick);
      if (!existing) {
        latestByNickname.set(nick, normalizedRow);
      } else {
        const prevTime = Date.parse(existing.created_at) || 0;
        const currTime = Date.parse(normalizedRow.created_at) || 0;
        // If timestamps are equal or unparseable, later row in sheet wins
        if (currTime >= prevTime) {
          latestByNickname.set(nick, normalizedRow);
        }
      }
    }

    return { ok: true, rows: Array.from(latestByNickname.values()) };
  } catch (error) {
    console.error('SheetDB GET network error:', error);
    return { ok: false, rows: [] };
  }
}
