import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  PenLine,
  X,
} from 'lucide-react';
import { SavedWritingRecord, WritingPromptConfig } from '../../types/game';
import { loadWritingDraft, saveWritingDraft } from '../../utils/storage';
import { validateWriting } from '../../utils/writingValidation';

interface WritingBoxProps {
  isOpen: boolean;
  prompt: WritingPromptConfig;
  onClose: () => void;
  onSubmitted?: (record: SavedWritingRecord) => void;
  allowSkip?: boolean;
  skipLabel?: string;
  onSkip?: () => void;
  hideShareToggle?: boolean;
  submitLabel?: string;
  contextBanner?: React.ReactNode;
  embedded?: boolean;
}

export function WritingBox({
  isOpen,
  prompt,
  onClose,
  onSubmitted,
  allowSkip = false,
  skipLabel = '나중에 쓸래요',
  onSkip,
  hideShareToggle = false,
  submitLabel = '다 썼어요',
  contextBanner,
  embedded = false,
}: WritingBoxProps) {
  const [content, setContent] = useState('');
  const [allowShare, setAllowShare] = useState(false);
  const [showStarters, setShowStarters] = useState(true);
  const [showExample, setShowExample] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(
    null,
  );
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Load auto-saved draft from localStorage whenever prompt changes or opens
  useEffect(() => {
    if (!isOpen) return;
    const saved = loadWritingDraft(prompt.promptId);
    setContent(saved?.content ?? '');
    setAllowShare(saved?.allowShare ?? false);
    setShowExample(false);
    setFeedback(null);
  }, [isOpen, prompt.promptId]);

  // Auto-save to localStorage on every change
  useEffect(() => {
    if (!isOpen) return;
    saveWritingDraft({
      promptId: prompt.promptId,
      content,
      allowShare,
      updatedAt: Date.now(),
    });
  }, [isOpen, prompt.promptId, content, allowShare]);

  // Track visualViewport for tablet on-screen keyboards so textarea is never obscured
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;
    const vv = window.visualViewport;
    if (!vv) return;

    const handleResize = () => {
      setViewportHeight(vv.height);
    };

    handleResize();
    vv.addEventListener('resize', handleResize);
    vv.addEventListener('scroll', handleResize);
    return () => {
      vv.removeEventListener('resize', handleResize);
      vv.removeEventListener('scroll', handleResize);
      setViewportHeight(null);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const trimmedLength = content.trim().length;
  const isReadyLength = trimmedLength >= prompt.minLength && trimmedLength <= prompt.maxLength;

  const handleInsertStarter = (starter: string) => {
    setFeedback(null);
    setContent((prev) => {
      const cleanPrev = prev.trimEnd();
      if (!cleanPrev) return starter;
      return `${cleanPrev}\n${starter}`;
    });
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  };

  const handleTextareaFocus = () => {
    setTimeout(() => {
      textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  const handleSubmit = () => {
    const result = validateWriting(content, prompt.minLength, prompt.maxLength);
    if (!result.valid) {
      setFeedback({
        type: 'error',
        message: result.message ?? '내용을 다시 한 번 확인해 주세요.',
      });
      textareaRef.current?.focus();
      return;
    }

    const record: SavedWritingRecord = {
      promptId: prompt.promptId,
      content: content.trim(),
      allowShare,
      updatedAt: Date.now(),
      submittedAt: Date.now(),
    };
    saveWritingDraft(record);
    setFeedback({
      type: 'success',
      message: '소중한 생각이 저장되었어요! 언제든 다시 꺼내어 고칠 수 있어요.',
    });
    onSubmitted?.(record);
  };

  const maxCardHeight = viewportHeight ? Math.max(300, viewportHeight - 24) : undefined;

  const innerContent = (
    <div
      ref={cardRef}
      style={!embedded && maxCardHeight ? { maxHeight: `${maxCardHeight}px` } : undefined}
      className={
        embedded
          ? 'w-full flex flex-col gap-4'
          : 'w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] overflow-y-auto paper-scroll bg-[#F7F3EA] text-[#172033] rounded-2xl shadow-2xl border border-[#ECE4D3] p-4 sm:p-7 flex flex-col gap-4'
      }
    >
      {/* Top Bar */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#236B67]">{prompt.title}</p>
          <h2
            id="writing-box-title"
            className="font-display text-lg sm:text-xl font-bold text-[#172033] mt-1 leading-snug"
          >
            {prompt.question}
          </h2>
        </div>
        {!embedded && (
          <button
            type="button"
            onClick={onClose}
            aria-label="글쓰기 상자 닫기"
            className="p-2 rounded-lg text-[#172033]/70 hover:text-[#172033] hover:bg-[#ECE4D3] transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {contextBanner}

      {/* Helper Toggle Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setShowStarters((prev) => !prev)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer ${
            showStarters
              ? 'bg-[#236B67] text-[#F7F3EA] border-[#236B67]'
              : 'bg-[#ECE4D3] text-[#172033] border-[#172033]/15 hover:bg-[#E2D8C4]'
          }`}
        >
          <PenLine className="w-3.5 h-3.5" />
          <span>문장 시작 도우미</span>
        </button>

        <button
          type="button"
          onClick={() => setShowExample((prev) => !prev)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer ${
            showExample
              ? 'bg-[#E8A33D] text-[#172033] border-[#E8A33D]'
              : 'bg-[#ECE4D3] text-[#172033] border-[#172033]/15 hover:bg-[#E2D8C4]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>예시 보기</span>
        </button>
      </div>

      {/* Sentence Starter Chips */}
      {showStarters && (
        <div className="p-3 rounded-xl bg-[#ECE4D3]/65 border border-[#172033]/10 space-y-2">
          <p className="text-xs font-medium text-[#172033]/75 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-[#E8A33D]" />
            <span>누르면 아래 글쓰기 칸에 문장 시작이 들어가요</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {prompt.starters.map((starter, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleInsertStarter(starter)}
                className="text-left px-3 py-1.5 rounded-lg bg-[#F7F3EA] hover:bg-white text-[#172033] text-xs font-medium border border-[#172033]/15 transition-colors cursor-pointer"
              >
                {starter}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Example Drawer */}
      {showExample && (
        <div className="p-3.5 rounded-xl bg-[#236B67]/10 border border-[#236B67]/25 text-xs sm:text-sm text-[#172033]/90 leading-relaxed">
          <p className="font-semibold text-[#236B67] mb-1">다른 친구의 예시 생각</p>
          <p>{prompt.example}</p>
        </div>
      )}

      {/* Main Writing Textarea */}
      <div>
        <textarea
          ref={textareaRef}
          value={content}
          onFocus={handleTextareaFocus}
          onChange={(e) => {
            setContent(e.target.value);
            if (feedback) setFeedback(null);
          }}
          maxLength={prompt.maxLength + 40}
          rows={embedded ? 4 : 5}
          placeholder="여기에 내 생각과 경험을 편하게 적어 보세요. 쓰는 동안 자동으로 저장돼요."
          className="w-full min-h-[125px] sm:min-h-[155px] p-4 rounded-xl bg-white border border-[#172033]/20 text-[#172033] text-sm sm:text-base leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-[#236B67]"
        />

        {/* Character Count + Auto-save info */}
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-[#172033]/65">
            자동 저장 중 · 전화번호, 이메일, 초등학교 이름은 쓰지 말아요
          </span>
          <span
            className={`tabular-nums font-semibold ${
              trimmedLength > prompt.maxLength
                ? 'text-[#B5463A]'
                : isReadyLength
                  ? 'text-[#236B67]'
                  : 'text-[#172033]/75'
            }`}
          >
            {trimmedLength}자 / 최소 {prompt.minLength}자 · 최대 {prompt.maxLength}자
          </span>
        </div>
      </div>

      {/* Validation or Saved Feedback */}
      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs sm:text-sm font-medium flex items-start gap-2 ${
            feedback.type === 'error'
              ? 'bg-[#B5463A]/10 border-[#B5463A]/30 text-[#8F2E24]'
              : 'bg-[#236B67]/12 border-[#236B67]/30 text-[#1B5350]'
          }`}
          role="status"
        >
          {feedback.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Footer: Share toggle + Actions */}
      <div className="pt-2 border-t border-[#172033]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {!hideShareToggle ? (
          <label className="flex items-center gap-2.5 text-xs sm:text-sm text-[#172033] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allowShare}
              onChange={(e) => setAllowShare(e.target.checked)}
              className="w-4 h-4 rounded accent-[#236B67] cursor-pointer"
            />
            <span>친구들에게 공개해도 좋아요</span>
          </label>
        ) : (
          <div />
        )}

        <div className="flex flex-wrap items-center justify-end gap-2">
          {allowSkip && onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="px-4 py-2.5 rounded-xl bg-[#ECE4D3] hover:bg-[#E2D8C4] text-[#172033] text-sm font-medium transition-colors cursor-pointer"
            >
              {skipLabel}
            </button>
          )}
          {!embedded && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#ECE4D3] hover:bg-[#E2D8C4] text-[#172033] text-sm font-medium transition-colors cursor-pointer"
            >
              잠시 닫기
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-[#E8A33D] hover:bg-[#DC9630] text-[#172033] text-sm font-bold shadow-sm transition-colors cursor-pointer"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );

  if (embedded) return innerContent;

  return (
    <div
      className="fixed inset-0 z-30 flex items-start sm:items-center justify-center p-3 sm:p-6 bg-[#172033]/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="writing-box-title"
    >
      {innerContent}
    </div>
  );
}
