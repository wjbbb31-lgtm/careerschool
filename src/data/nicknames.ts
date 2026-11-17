const ADJECTIVES = [
  '새벽의',
  '조용한',
  '따뜻한',
  '푸른',
  '은빛',
  '잔잔한',
  '노을빛',
  '차분한',
  '깊은',
  '맑은',
  '부드러운',
  '반짝이는',
];

const NOUNS = [
  '항해사',
  '탐험가',
  '기록자',
  '나침반',
  '등대지기',
  '여행자',
  '별지기',
  '독서가',
  '길잡이',
  '관찰자',
];

export function generateNickname(previous?: string): string {
  for (let i = 0; i < 6; i++) {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = Math.floor(10 + Math.random() * 90);
    const candidate = `${adj} ${noun} ${num}`;
    if (candidate !== previous) {
      return candidate;
    }
  }
  return `새벽의 항해사 ${Math.floor(10 + Math.random() * 90)}`;
}
