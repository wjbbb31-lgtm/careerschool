export interface WritingValidationResult {
  valid: boolean;
  reason?: 'too_short' | 'too_long' | 'privacy' | 'profanity';
  message?: string;
}

// Common Korean profanity / offensive words list tailored for elementary safety
const PROFANITY_LIST = [
  '시발',
  '씨발',
  'ㅅㅂ',
  'ㅆㅂ',
  '병신',
  'ㅂㅅ',
  '개새끼',
  '새끼',
  '미친놈',
  '미친년',
  '지랄',
  'ㅈㄹ',
  '존나',
  'ㅈㄴ',
  '개같',
  '닥쳐',
  '꺼져',
  '죽어라',
  '느금마',
  '애미',
  '엠창',
  '썅',
  '염병',
  '호로',
  '찐따',
  '또라이',
  '걸레',
  '창녀',
  '보지',
  '자지',
  'fuck',
  'shit',
  'bitch',
  'asshole',
];

export function hasPrivacyIssue(text: string): boolean {
  const normalized = text.replace(/\s+/g, ' ');

  // 1. Email address or @ handle pattern
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+/.test(normalized) || normalized.includes('@')) {
    return true;
  }

  // 2. Phone number pattern: 010... or any 9+ digits even when separated by hyphens/spaces/dots
  const digitsOnly = normalized.replace(/[^0-9]/g, '');
  if (/01[016789]/.test(digitsOnly) && digitsOnly.length >= 8) {
    return true;
  }
  // Check contiguous digits separated only by -, ., space, (, )
  const phoneChunks = normalized.match(/[0-9][0-9\s.\-()]{7,}[0-9]/g);
  if (phoneChunks) {
    for (const chunk of phoneChunks) {
      const chunkDigits = chunk.replace(/[^0-9]/g, '');
      if (chunkDigits.length >= 9) {
        return true;
      }
    }
  }
  if (/[0-9]{9,}/.test(normalized)) {
    return true;
  }

  // 3. School name patterns: "초등학교", "초교", or "<Name>초" paired with school context
  if (/초등학교|초교/.test(normalized)) {
    return true;
  }
  if (/[가-힣]{2,8}초\s*(학교|학생|출신|[1-6]학년)/.test(normalized)) {
    return true;
  }

  return false;
}

export function hasProfanity(text: string): boolean {
  const lowered = text.toLowerCase();
  const compact = lowered.replace(/[\s._\-!*]+/g, '');
  return PROFANITY_LIST.some((word) => {
    const cleanWord = word.toLowerCase();
    return lowered.includes(cleanWord) || compact.includes(cleanWord);
  });
}

export function validateWriting(
  text: string,
  minLength: number,
  maxLength: number,
): WritingValidationResult {
  const trimmed = text.trim();

  if (hasProfanity(trimmed)) {
    return {
      valid: false,
      reason: 'profanity',
      message: '고운 말로 바꿔 볼까요?',
    };
  }

  if (hasPrivacyIssue(trimmed)) {
    return {
      valid: false,
      reason: 'privacy',
      message: '개인정보는 빼고 써 주세요',
    };
  }

  if (trimmed.length < minLength) {
    return {
      valid: false,
      reason: 'too_short',
      message: '조금만 더 자세히 써 볼까요? 경험을 하나 넣어 보면 좋아요',
    };
  }

  if (trimmed.length > maxLength) {
    return {
      valid: false,
      reason: 'too_long',
      message: `최대 ${maxLength}자까지만 쓸 수 있어요. 조금만 줄여 볼까요?`,
    };
  }

  return { valid: true };
}
