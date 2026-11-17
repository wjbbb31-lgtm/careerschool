import { useEffect, useState } from 'react';
import { Sparkles, X, RefreshCw } from 'lucide-react';
import {
  CH3_WRITING_PROMPT,
  SERENDIPITY_ATTITUDES,
  SERENDIPITY_CARDS,
} from '../../data/chapters';
import {
  Chapter3State,
  SavedWritingRecord,
  SerendipityAttitudeId,
} from '../../types/game';
import { WritingBox } from './WritingBox';

interface Chapter3ModalProps {
  isOpen: boolean;
  state: Chapter3State;
  onUpdateState: (next: Chapter3State) => void;
  onComplete: (record: SavedWritingRecord) => void;
  onClose: () => void;
}

export function Chapter3Modal({
  isOpen,
  state,
  onUpdateState,
  onComplete,
  onClose,
}: Chapter3ModalProps) {
  const [step, setStep] = useState<'bottle' | 'card-attitude' | 'writing'>('bottle');

  useEffect(() => {
    if (!isOpen) return;
    if (state.completed && state.attitudeId) {
      setStep('writing');
    } else if (state.cardId) {
      setStep('bottle');
    } else {
      setStep('bottle');
    }
  }, [isOpen, state.completed, state.attitudeId, state.cardId]);

  if (!isOpen) return null;

  const card =
    SERENDIPITY_CARDS.find((c) => c.id === state.cardId) ?? SERENDIPITY_CARDS[0];
  const selectedAttitude = SERENDIPITY_ATTITUDES.find(
    (a) => a.id === state.attitudeId,
  );

  const handleOpenBottle = () => {
    if (!state.cardId) {
      const randomCard =
        SERENDIPITY_CARDS[Math.floor(Math.random() * SERENDIPITY_CARDS.length)];
      onUpdateState({ ...state, cardId: randomCard.id });
    }
    setStep('card-attitude');
  };

  const handlePickAttitude = (attitudeId: SerendipityAttitudeId) => {
    onUpdateState({ ...state, attitudeId });
  };

  const handleDrawAnotherCard = () => {
    const others = SERENDIPITY_CARDS.filter((c) => c.id !== card.id);
    const nextCard = others[Math.floor(Math.random() * others.length)];
    onUpdateState({ ...state, cardId: nextCard.id });
  };

  return (
    <div
      className="fixed inset-0 z-30 flex items-start sm:items-center justify-center p-3 sm:p-6 bg-[#172033]/55"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] overflow-y-auto paper-scroll bg-[#F7F3EA] text-[#172033] rounded-2xl shadow-2xl border border-[#ECE4D3] p-5 sm:p-7 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#172033]/10">
          <div>
            <p className="text-xs font-semibold text-[#236B67]">
              3장 우연의 바다 · 크럼볼츠 계획된 우연
            </p>
            <h2 className="font-display text-lg sm:text-xl font-bold mt-0.5">
              {step === 'bottle'
                ? '바다에서 다가온 유리병'
                : step === 'card-attitude'
                  ? '우연 카드와 나의 태도 고르기'
                  : '우연을 기회로 바꾸는 글쓰기'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="p-2 rounded-lg text-[#172033]/70 hover:bg-[#ECE4D3] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Glass Bottle Reveal */}
        {step === 'bottle' && (
          <div className="py-4 flex flex-col items-center text-center gap-4">
            <div className="w-24 h-24 rounded-2xl bg-[#236B67]/12 border border-[#236B67]/25 flex items-center justify-center">
              <svg viewBox="0 0 64 64" className="w-16 h-16" aria-hidden="true">
                <rect x="26" y="7" width="12" height="7" rx="2" fill="#9D7048" />
                <path
                  d="M27 14 L37 14 L39 22 L45 28 L45 53 C45 56 42 58 39 58 L25 58 C22 58 19 56 19 53 L19 28 L25 22 Z"
                  fill="#A6E0DA"
                  stroke="#236B67"
                  strokeWidth="2"
                />
                <rect x="27" y="30" width="10" height="22" rx="2" fill="#F7F3EA" />
                <line x1="29" y1="35" x2="35" y2="35" stroke="#E8A33D" strokeWidth="2" />
                <line x1="29" y1="41" x2="35" y2="41" stroke="#236B67" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="max-w-md space-y-1.5">
              <p className="font-display text-lg font-bold text-[#172033]">
                물결을 타고 유리병 하나가 배 곁으로 다가왔어요.
              </p>
              <p className="text-sm text-[#172033]/75 leading-relaxed">
                유리병 안에 담긴 &lsquo;우연 카드&rsquo;를 열어 보고, 뜻밖의 상황을 기회로 바꾸는 나의 태도를 골라 볼까요?
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenBottle}
              className="mt-2 px-6 py-3 rounded-xl bg-[#E8A33D] hover:bg-[#DC9630] text-[#172033] text-sm font-bold shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>유리병 열기</span>
            </button>
          </div>
        )}

        {/* Step 2: Random Chance Card + 5 Attitudes */}
        {step === 'card-attitude' && (
          <div className="space-y-5">
            {/* Drawn Chance Card */}
            <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#E8A33D]/60 shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-[#E8A33D]">유리병 속 우연 카드</span>
                {!state.completed && (
                  <button
                    type="button"
                    onClick={handleDrawAnotherCard}
                    className="text-xs text-[#172033]/65 hover:text-[#172033] flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>다른 카드 뽑기</span>
                  </button>
                )}
              </div>
              <p className="font-display text-base sm:text-lg font-bold text-[#172033] leading-relaxed">
                &ldquo;{card.text}&rdquo;
              </p>
            </div>

            {/* 5 Attitudes */}
            <div>
              <p className="text-sm font-bold text-[#172033] mb-2">
                이 순간, 어떤 태도를 꺼내어 써 볼까요? (1가지 선택)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SERENDIPITY_ATTITUDES.map((att) => {
                  const active = state.attitudeId === att.id;
                  return (
                    <button
                      key={att.id}
                      type="button"
                      onClick={() => handlePickAttitude(att.id)}
                      className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#236B67] text-[#F7F3EA] border-[#236B67] shadow-sm'
                          : 'bg-white text-[#172033] border-[#172033]/15 hover:bg-[#ECE4D3]/60'
                      }`}
                    >
                      <p className="text-sm font-bold">{att.name}</p>
                      <p
                        className={`mt-1 text-xs leading-relaxed ${
                          active ? 'text-[#F7F3EA]/90' : 'text-[#172033]/75'
                        }`}
                      >
                        {att.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#172033]/10">
              <button
                type="button"
                disabled={!state.attitudeId}
                onClick={() => setStep('writing')}
                className="px-5 py-2.5 rounded-xl bg-[#E8A33D] hover:bg-[#DC9630] disabled:opacity-45 text-[#172033] text-sm font-bold cursor-pointer disabled:cursor-not-allowed"
              >
                이 태도로 글 쓰기
              </button>
            </div>
          </div>
        )}

        {/* Step 3: WritingBox ③ */}
        {step === 'writing' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setStep('card-attitude')}
                className="text-xs font-semibold text-[#236B67] hover:underline cursor-pointer"
              >
                &larr; 카드·태도 다시 보기
              </button>
            </div>
            <WritingBox
              isOpen
              embedded
              hideShareToggle
              prompt={CH3_WRITING_PROMPT}
              contextBanner={
                <div className="p-3 rounded-xl bg-white border border-[#172033]/15 text-xs space-y-1">
                  <p className="text-[#172033]/70">
                    우연 카드: <span className="font-semibold text-[#172033]">{card.text}</span>
                  </p>
                  {selectedAttitude && (
                    <p className="text-[#236B67] font-semibold">
                      고른 태도: {selectedAttitude.name} — {selectedAttitude.description}
                    </p>
                  )}
                </div>
              }
              onClose={onClose}
              onSubmitted={(record) => {
                onUpdateState({ ...state, cardId: card.id, completed: true });
                onComplete(record);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
