import { useEffect, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Lock, Users, X } from 'lucide-react';
import {
  CH4_LETTER_PROMPT,
  CH4_SENTENCE_PROMPT,
  CH4_TITLE_PROMPT,
  getTopHollandCode,
  SERENDIPITY_ATTITUDES,
  SERENDIPITY_CARDS,
} from '../../data/chapters';
import {
  Chapter3State,
  Chapter4State,
  FourSData,
  HollandScores,
  PlayerProfile,
} from '../../types/game';
import { loadWritingDraft } from '../../utils/storage';
import { WritingBox } from './WritingBox';

interface Chapter4ModalProps {
  isOpen: boolean;
  initialStep?: 'review' | 'title' | 'sentence' | 'letter' | 'share';
  profile: PlayerProfile;
  hollandScores: HollandScores;
  fourS: FourSData;
  ch3State: Chapter3State;
  ch4State: Chapter4State;
  onUpdateCh4: (next: Chapter4State) => void;
  onComplete: (finalState: Chapter4State) => void;
  onClose: () => void;
}

export function Chapter4Modal({
  isOpen,
  initialStep = 'review',
  profile,
  hollandScores,
  fourS,
  ch3State,
  ch4State,
  onUpdateCh4,
  onComplete,
  onClose,
}: Chapter4ModalProps) {
  const [step, setStep] = useState<'review' | 'title' | 'sentence' | 'letter' | 'share'>(
    initialStep,
  );
  const [reviewPage, setReviewPage] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
      setReviewPage(0);
    }
  }, [isOpen, initialStep]);

  if (!isOpen) return null;

  const interestDraft = loadWritingDraft('interest-reflection')?.content?.trim();
  const lighthouseDraft = loadWritingDraft('lighthouse-reflection')?.content?.trim();
  const ch3Draft = loadWritingDraft('ch3-serendipity')?.content?.trim();
  const ch3Card = SERENDIPITY_CARDS.find((c) => c.id === ch3State.cardId);
  const ch3Att = SERENDIPITY_ATTITUDES.find((a) => a.id === ch3State.attitudeId);

  const reviewPages = [
    {
      chapter: '1쪽 · 흥미의 장',
      subtitle: `나의 흥미 코드 ${getTopHollandCode(hollandScores)}`,
      body:
        interestDraft ||
        '흥미의 섬에서 나의 관심사와 좋아서 몰입하는 시간을 떠올려 보았어요.',
    },
    {
      chapter: '2쪽 · 전환의 장',
      subtitle: '중학교를 앞둔 나의 4S 나침반',
      body: `상황: ${fourS.situation}\n나: ${fourS.self}\n도움: ${fourS.support}\n방법: ${fourS.strategy}${
        lighthouseDraft ? `\n\n등대 기록: ${lighthouseDraft}` : ''
      }`,
    },
    {
      chapter: '3쪽 · 우연의 장',
      subtitle: ch3Att ? `선택한 태도 · ${ch3Att.name}` : '계획된 우연 이야기',
      body: `${ch3Card ? `우연 카드: "${ch3Card.text}"\n\n` : ''}${
        ch3Draft || '우연의 바다에서 뜻밖의 일을 기회로 바꾸는 생각을 적어 보았어요.'
      }`,
    },
  ];

  const stepOrder = ['review', 'title', 'sentence', 'letter', 'share'] as const;
  const currentStepIdx = stepOrder.indexOf(step);

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
              4장 서재의 섬 · 나의 다음 페이지 쓰기 ({currentStepIdx + 1} / 5)
            </p>
            <h2 className="font-display text-lg sm:text-xl font-bold mt-0.5">
              {step === 'review' && '지금까지 모아 온 나의 이야기'}
              {step === 'title' && '나의 다음 책 제목 정하기'}
              {step === 'sentence' && '책의 첫 문장 쓰기'}
              {step === 'letter' && '중학생이 된 나에게 편지 쓰기'}
              {step === 'share' && '이 책을 누구와 나눌까요?'}
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

        {/* Step 0: Flipping through past writings */}
        {step === 'review' && (
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-[#172033]/75">
              큰 책 조형물 앞에서 {profile.nickname}님이 지금까지 걸어온 페이지를 한 장씩 넘겨 보아요.
            </p>

            <div className="p-5 rounded-xl bg-white border border-[#172033]/15 shadow-sm min-h-[190px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 pb-2 mb-3 border-b border-[#172033]/10">
                  <span className="text-xs font-bold text-[#236B67]">
                    {reviewPages[reviewPage].chapter}
                  </span>
                  <span className="text-xs text-[#172033]/65">
                    {reviewPages[reviewPage].subtitle}
                  </span>
                </div>
                <p className="text-sm text-[#172033] leading-relaxed whitespace-pre-line">
                  {reviewPages[reviewPage].body}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#172033]/10 flex items-center justify-between">
                <button
                  type="button"
                  disabled={reviewPage === 0}
                  onClick={() => setReviewPage((p) => Math.max(0, p - 1))}
                  className="px-3 py-1.5 rounded-lg bg-[#ECE4D3] disabled:opacity-40 text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:cursor-default"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>이전 장</span>
                </button>
                <span className="text-xs tabular-nums font-medium text-[#172033]/70">
                  {reviewPage + 1} / {reviewPages.length}
                </span>
                <button
                  type="button"
                  disabled={reviewPage === reviewPages.length - 1}
                  onClick={() => setReviewPage((p) => Math.min(reviewPages.length - 1, p + 1))}
                  className="px-3 py-1.5 rounded-lg bg-[#ECE4D3] disabled:opacity-40 text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:cursor-default"
                >
                  <span>다음 장</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep('title')}
                className="px-5 py-2.5 rounded-xl bg-[#E8A33D] hover:bg-[#DC9630] text-[#172033] text-sm font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>나의 다음 페이지 쓰기</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Book Title (5~25 chars) */}
        {step === 'title' && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setStep('review')}
              className="text-xs font-semibold text-[#236B67] hover:underline cursor-pointer"
            >
              &larr; 지난 기록 다시 보기
            </button>
            <WritingBox
              isOpen
              embedded
              hideShareToggle
              submitLabel="제목 정하기 완료"
              prompt={CH4_TITLE_PROMPT}
              onClose={onClose}
              onSubmitted={(record) => {
                onUpdateCh4({ ...ch4State, bookTitle: record.content });
                setStep('sentence');
              }}
            />
          </div>
        )}

        {/* Step 2: First Sentence (15~80 chars) */}
        {step === 'sentence' && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setStep('title')}
              className="text-xs font-semibold text-[#236B67] hover:underline cursor-pointer"
            >
              &larr; 책 제목 다시 고치기
            </button>
            <WritingBox
              isOpen
              embedded
              hideShareToggle
              submitLabel="첫 문장 정하기 완료"
              prompt={CH4_SENTENCE_PROMPT}
              contextBanner={
                ch4State.bookTitle ? (
                  <div className="px-3.5 py-2 rounded-xl bg-white border border-[#172033]/15 text-xs">
                    책 제목: <span className="font-bold text-[#172033]">{ch4State.bookTitle}</span>
                  </div>
                ) : null
              }
              onClose={onClose}
              onSubmitted={(record) => {
                onUpdateCh4({ ...ch4State, firstSentence: record.content });
                setStep('letter');
              }}
            />
          </div>
        )}

        {/* Step 3: Optional Letter (50~400 chars, skippable) */}
        {step === 'letter' && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setStep('sentence')}
              className="text-xs font-semibold text-[#236B67] hover:underline cursor-pointer"
            >
              &larr; 첫 문장 다시 고치기
            </button>
            <WritingBox
              isOpen
              embedded
              hideShareToggle
              allowSkip
              skipLabel="나중에 쓸래요"
              submitLabel="편지 담아 두기"
              prompt={CH4_LETTER_PROMPT}
              onSkip={() => {
                onUpdateCh4({ ...ch4State, letterSkipped: true });
                setStep('share');
              }}
              onClose={onClose}
              onSubmitted={(record) => {
                onUpdateCh4({
                  ...ch4State,
                  letter: record.content,
                  letterSkipped: false,
                });
                setStep('share');
              }}
            />
          </div>
        )}

        {/* Step 4: Public Share vs Teacher-only Choice */}
        {step === 'share' && (
          <div className="space-y-5">
            <button
              type="button"
              onClick={() => setStep('letter')}
              className="text-xs font-semibold text-[#236B67] hover:underline cursor-pointer"
            >
              &larr; 편지 단계로 돌아가기
            </button>

            <div className="p-4 rounded-xl bg-white border border-[#172033]/15 space-y-1.5">
              <p className="text-xs font-semibold text-[#236B67]">내가 만든 책 미리보기</p>
              <p className="font-display text-lg font-bold text-[#172033]">
                {ch4State.bookTitle || '나의 다음 페이지'}
              </p>
              <p className="text-sm text-[#172033]/85 italic">
                &ldquo;{ch4State.firstSentence || '새로운 첫 문장이 열립니다.'}&rdquo;
              </p>
            </div>

            <div className="space-y-2.5">
              <p className="text-sm font-bold text-[#172033]">
                완성된 책의 제목과 첫 문장을 어떻게 나눌까요?
              </p>

              <button
                type="button"
                onClick={() => onUpdateCh4({ ...ch4State, allowPublicShare: true })}
                className={`w-full text-left p-4 rounded-xl border transition-colors flex items-start gap-3 cursor-pointer ${
                  ch4State.allowPublicShare
                    ? 'bg-[#236B67] text-[#F7F3EA] border-[#236B67]'
                    : 'bg-white text-[#172033] border-[#172033]/15 hover:bg-[#ECE4D3]/60'
                }`}
              >
                <Users className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold">
                    제목과 첫 문장을 친구들 화면에 공개해도 좋아요
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${
                      ch4State.allowPublicShare ? 'text-[#F7F3EA]/85' : 'text-[#172033]/65'
                    }`}
                  >
                    반 친구들과 서로의 책 제목과 첫 문장을 보며 응원할 수 있어요. (편지는 나만 봐요)
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onUpdateCh4({ ...ch4State, allowPublicShare: false })}
                className={`w-full text-left p-4 rounded-xl border transition-colors flex items-start gap-3 cursor-pointer ${
                  !ch4State.allowPublicShare
                    ? 'bg-[#172033] text-[#F7F3EA] border-[#172033]'
                    : 'bg-white text-[#172033] border-[#172033]/15 hover:bg-[#ECE4D3]/60'
                }`}
              >
                <Lock className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold">선생님만 볼래요</p>
                  <p
                    className={`text-xs mt-0.5 ${
                      !ch4State.allowPublicShare ? 'text-[#F7F3EA]/85' : 'text-[#172033]/65'
                    }`}
                  >
                    친구들 화면에는 보이지 않고 선생님께만 소중하게 전달돼요.
                  </p>
                </div>
              </button>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#172033]/10">
              <button
                type="button"
                onClick={() => {
                  const finalState: Chapter4State = { ...ch4State, completed: true };
                  onUpdateCh4(finalState);
                  onComplete(finalState);
                }}
                className="px-6 py-3 rounded-xl bg-[#E8A33D] hover:bg-[#DC9630] text-[#172033] text-sm font-bold shadow-md cursor-pointer"
              >
                나의 책 완성하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
