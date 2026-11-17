import {
  FourSData,
  HollandScores,
  HollandTypeId,
  SerendipityAttitude,
  SerendipityCard,
  WritingPromptConfig,
} from '../types/game';

export const HOLLAND_META: {
  id: HollandTypeId;
  code: string;
  label: string;
  shortLabel: string;
  hint: string;
}[] = [
  { id: 'R', code: 'R', label: '만들기·움직이기(R)', shortLabel: '현실', hint: '손으로 만들고 몸을 움직이는 활동' },
  { id: 'I', code: 'I', label: '탐구·알아내기(I)', shortLabel: '탐구', hint: '이유를 묻고 깊이 파고드는 활동' },
  { id: 'A', code: 'A', label: '표현·상상하기(A)', shortLabel: '예술', hint: '글, 그림, 음악 등으로 자유롭게 표현' },
  { id: 'S', code: 'S', label: '도움·함께하기(S)', shortLabel: '사회', hint: '친구 이야기를 듣고 함께 어울리는 활동' },
  { id: 'E', code: 'E', label: '이끌기·도전하기(E)', shortLabel: '진취', hint: '모임을 이끌고 새로운 목표에 도전' },
  { id: 'C', code: 'C', label: '정리·계획하기(C)', shortLabel: '관습', hint: '차근차근 정리하고 규칙을 지키는 활동' },
];

export const DEFAULT_HOLLAND_SCORES: HollandScores = {
  R: 3,
  I: 4,
  A: 4,
  S: 4,
  E: 3,
  C: 3,
};

export function getTopHollandCode(scores: HollandScores): string {
  const sorted = [...HOLLAND_META].sort((a, b) => scores[b.id] - scores[a.id]);
  return sorted
    .slice(0, 3)
    .map((item) => item.code)
    .join(' · ');
}

export const MIDDLE_SCHOOL_WORRIES: string[] = [
  '새로운 친구 사귀기',
  '어려워지는 수업과 시험',
  '낯선 선생님과 교실 분위기',
  '아침 등교와 생활 규칙 변화',
  '혼자 스스로 챙겨야 할 일들',
];

export const DEFAULT_FOUR_S: FourSData = {
  situation: '새로운 친구 사귀기',
  self: '낯선 일에도 조금씩 적응해 가는 힘을 가지고 있어요.',
  support: '가족과 선생님, 함께 올라가는 친구들이 곁에 있어요.',
  strategy: '궁금한 점이 생기면 먼저 물어보고 작은 목표부터 실천할 거예요.',
};

export const SERENDIPITY_CARDS: SerendipityCard[] = [
  {
    id: 'club',
    text: '원하던 동아리가 마감되어 생각지 못한 연극 동아리에 들어가게 됐어요',
  },
  {
    id: 'seatmate',
    text: '짝꿍이 전학 가서 처음 보는 친구와 짝이 됐어요',
  },
  {
    id: 'presentation',
    text: '준비한 발표 날, 갑자기 발표 순서가 맨 처음으로 바뀌었어요',
  },
  {
    id: 'library-book',
    text: '도서관에서 우연히 집어 든 책이 전혀 모르는 분야의 책이었어요',
  },
  {
    id: 'sports-day',
    text: '운동회에서 원하지 않던 종목에 나가게 됐어요',
  },
  {
    id: 'new-hobby',
    text: '친구가 내가 한 번도 해 보지 않은 취미를 같이 하자고 했어요',
  },
];

export const SERENDIPITY_ATTITUDES: SerendipityAttitude[] = [
  {
    id: 'curiosity',
    name: '호기심',
    description: '낯선 일이나 새로운 분야를 "어떨까?" 하고 궁금해하며 들여다보는 마음',
  },
  {
    id: 'persistence',
    name: '끈기',
    description: '처음엔 어색하거나 어려워도 조금 더 이어가며 쉽게 포기하지 않는 힘',
  },
  {
    id: 'flexibility',
    name: '유연성',
    description: '계획이 바뀌어도 당황하지 않고 다른 방법을 찾아 맞춰 보는 태도',
  },
  {
    id: 'optimism',
    name: '낙관성',
    description: '"괜찮아, 좋은 경험이 될 거야"라고 긍정적인 가능성을 믿는 마음',
  },
  {
    id: 'risktaking',
    name: '도전',
    description: '결과가 완벽하지 않아도 일단 한 걸음 먼저 해 보는 용기',
  },
];

export const CH3_WRITING_PROMPT: WritingPromptConfig = {
  promptId: 'ch3-serendipity',
  islandId: 'serendipity',
  title: '3장 우연의 바다 · 계획된 우연',
  question: '그 태도로 이 우연을 어떻게 기회로 바꿀 수 있을까요? 두 문장 이상 써 보세요.',
  minLength: 30,
  maxLength: 150,
  starters: [
    '처음에는 ___하겠지만',
    '그래도 나는 ___해 볼 거예요',
    '어쩌면 이 일 덕분에',
  ],
  example:
    '처음에는 낯설고 당황스럽겠지만, 그래도 나는 호기심을 가지고 한 번 부딪혀 볼 거예요. 어쩌면 이 일 덕분에 내가 몰랐던 새로운 즐거움을 발견할지도 몰라요.',
};

export const CH4_TITLE_PROMPT: WritingPromptConfig = {
  promptId: 'ch4-book-title',
  islandId: 'library',
  title: '4장 서재의 섬 · 1단계 책 제목',
  question: '중학생이 될 나의 다음 책, 제목은?',
  minLength: 5,
  maxLength: 25,
  starters: [
    '용기 내서 ___하기',
    '작은 발걸음의 ___',
    '나의 새로운 ___ 페이지',
  ],
  example: '용기 내서 말 걸기 / 실험실의 탐험가',
};

export const CH4_SENTENCE_PROMPT: WritingPromptConfig = {
  promptId: 'ch4-first-sentence',
  islandId: 'library',
  title: '4장 서재의 섬 · 2단계 첫 문장',
  question: '그 책의 첫 문장을 써 보세요.',
  minLength: 15,
  maxLength: 80,
  starters: [
    '중학교 첫날, 나는 ___했다.',
    '교실 문을 열고 들어서며 나는 ___다.',
    '새로운 책가방을 메고 오늘 나는 ___한다.',
  ],
  example: '중학교 첫날, 나는 옆자리 친구에게 먼저 인사했다.',
};

export const CH4_LETTER_PROMPT: WritingPromptConfig = {
  promptId: 'ch4-letter',
  islandId: 'library',
  title: '4장 서재의 섬 · 3단계 미래의 나에게 (선택)',
  question: '중학생이 된 나에게 따뜻한 편지를 써 볼까요?',
  minLength: 50,
  maxLength: 400,
  starters: [
    '중학생이 된 나에게',
    '지금 나는 ___이 걱정되지만',
    '네가 꼭 기억했으면 하는 것은',
    '1년 뒤 너는',
  ],
  example:
    '중학생이 된 나에게. 지금 나는 낯선 친구들과 새로운 과목들이 조금 걱정되지만, 6학년 때도 결국 잘 해냈잖아. 네가 꼭 기억했으면 하는 것은 실수해도 괜찮다는 거야. 1년 뒤 너는 분명 웃으며 이 글을 다시 읽고 있을 거야.',
};
