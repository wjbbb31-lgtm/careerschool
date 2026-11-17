import { HairStyleOption, IslandDefinition, OutfitColorOption } from '../types/game';

export const HAIR_STYLE_OPTIONS: HairStyleOption[] = [
  { id: 'bob', label: '단정한 단발' },
  { id: 'short', label: '자연스러운 숏컷' },
  { id: 'ponytail', label: '묶은 머리' },
];

export const OUTFIT_COLOR_OPTIONS: OutfitColorOption[] = [
  { id: 'teal', label: '청록', hex: '#236B67' },
  { id: 'amber', label: '호박', hex: '#E8A33D' },
  { id: 'navy', label: '밤남색', hex: '#344970' },
  { id: 'sand', label: '모래베이지', hex: '#B8A689' },
  { id: 'terracotta', label: '노을빛', hex: '#B56357' },
  { id: 'forest', label: '숲이끼', hex: '#4B725B' },
];

export const ISLANDS: IslandDefinition[] = [
  {
    id: 'interest',
    orderLabel: '1',
    name: '흥미의 섬',
    shortDesc: '시간 가는 줄 모르고 빠져드는 나의 관심사를 떠올리는 육각 광장',
    position: [0, 0, 0],
    dockPosition: [5.4, 0, -4.8],
    landingPosition: [3.2, 0.35, -2.6],
    writingSpotPosition: [0, 0.35, -1.6],
    walkRadius: 5.5,
    accentColor: '#E8A33D',
    writingPrompt: {
      promptId: 'interest-reflection',
      islandId: 'interest',
      title: '흥미의 섬 · 기록하기',
      question: '요즘 시간 가는 줄 모르고 빠져드는 일이나, 자꾸 눈길이 가는 주제는 무엇인가요?',
      minLength: 25,
      maxLength: 300,
      starters: [
        '나는 ___할 때 시간 가는 줄 모르고 집중하게 돼요.',
        '요즘 내가 가장 궁금해하는 주제는 ___이에요.',
        '친구나 가족이 나에게 ___을(를) 잘한다고 말해 준 적이 있어요.',
        '혼자 있을 때 내가 자주 찾아보거나 직접 만들어 보는 것은 ___이에요.',
      ],
      example:
        '나는 친구들과 보드게임 규칙을 새로 바꿀 때 시간 가는 줄 모르고 집중하게 돼요. 어떻게 하면 모두가 더 재미있게 놀 수 있을지 고민하다 보면 한 시간이 금방 지나가요.',
    },
  },
  {
    id: 'lighthouse',
    orderLabel: '2',
    name: '전환의 등대 섬',
    shortDesc: '초등학교에서 중학교로 건너가는 마음을 비추는 바닷가 등대',
    position: [23, 0, -13],
    dockPosition: [17.8, 0, -9.2],
    landingPosition: [19.8, 0.35, -10.8],
    writingSpotPosition: [23.8, 0.35, -11.4],
    walkRadius: 5.0,
    accentColor: '#E8A33D',
    writingPrompt: {
      promptId: 'lighthouse-reflection',
      islandId: 'lighthouse',
      title: '전환의 등대 섬 · 기록하기',
      question: '중학교라는 새로운 바다를 앞두고 가장 기대되는 점과 조금 걱정되는 마음은 무엇인가요?',
      minLength: 25,
      maxLength: 300,
      starters: [
        '중학교에 가면 가장 기대되는 것은 ___이에요.',
        '솔직히 조금 떨리거나 걱정되는 부분은 ___이에요.',
        '6학년을 지나며 내가 예전보다 성장했다고 느낀 점은 ___이에요.',
        '새로운 환경에서 내가 꼭 지켜 가고 싶은 나만의 다짐은 ___이에요.',
      ],
      example:
        '중학교에 가면 여러 초등학교에서 온 친구들과 새로운 동아리 활동을 해 보고 싶어서 기대돼요. 처음엔 낯설어서 조금 긴장되겠지만 먼저 인사를 건네 보려고 해요.',
    },
  },
  {
    id: 'serendipity',
    orderLabel: '3',
    name: '우연의 바다',
    shortDesc: '뜻밖의 만남과 작은 용기가 물결처럼 모이는 소용돌이 만',
    position: [-22, 0, -15],
    dockPosition: [-16.0, 0, -11.4],
    landingPosition: [-18.2, 0.35, -12.8],
    writingSpotPosition: [-20.4, 0.35, -11.6],
    walkRadius: 5.0,
    walkInnerRadius: 2.3,
    accentColor: '#236B67',
    writingPrompt: {
      promptId: 'serendipity-reflection',
      islandId: 'serendipity',
      title: '우연의 바다 · 기록하기',
      question: '우연한 계기로 시작했는데 의외로 재미있었거나, 나에게 새로운 문을 열어 준 경험이 있나요?',
      minLength: 25,
      maxLength: 300,
      starters: [
        '처음에는 우연히 ___하게 되었는데 생각보다 무척 즐거웠어요.',
        '망설이다가 한 번 도전해 봤는데 뜻밖에 ___을(를) 알게 되었어요.',
        '앞으로 뜻밖의 기회가 찾아온다면 ___에 용기를 내 보고 싶어요.',
      ],
      example:
        '처음에는 친구가 같이 가자고 해서 도서관 북클럽에 따라갔는데, 생각보다 책을 읽고 이야기 나누는 시간이 재미있었어요. 작은 우연이 새로운 취미가 된 기분이에요.',
    },
  },
  {
    id: 'library',
    orderLabel: '4',
    name: '서재의 섬',
    shortDesc: '지금까지의 이야기를 정리하고 나의 다음 페이지를 여는 곳',
    position: [1, 0, -31],
    dockPosition: [1.2, 0, -24.4],
    landingPosition: [1.2, 0.35, -26.8],
    writingSpotPosition: [1.0, 0.35, -29.0],
    walkRadius: 5.4,
    accentColor: '#ECE4D3',
    writingPrompt: {
      promptId: 'library-reflection',
      islandId: 'library',
      title: '서재의 섬 · 나의 다음 페이지',
      question: '지금까지의 나를 한 줄로 정리해 보고, 앞으로 펼치고 싶은 나의 다음 페이지를 적어 보세요.',
      minLength: 30,
      maxLength: 300,
      starters: [
        '지금까지의 나는 ___한 사람이라고 말할 수 있어요.',
        '앞으로 열릴 나의 다음 페이지에는 ___한 이야기가 담기면 좋겠어요.',
        '미래의 나에게 오늘 건네고 싶은 한마디는 "___"이에요.',
        '나의 장점을 살려 중학교 첫 해에는 ___을(를) 시도해 볼 거예요.',
      ],
      example:
        '지금까지의 나는 궁금한 게 생기면 끝까지 찾아보는 사람이에요. 앞으로 열릴 나의 다음 페이지에는 실패하더라도 다시 도전하며 나만의 속도로 자라는 이야기가 담기면 좋겠어요.',
    },
  },
];

export function getIslandById(id: string): IslandDefinition {
  return ISLANDS.find((island) => island.id === id) ?? ISLANDS[0];
}
