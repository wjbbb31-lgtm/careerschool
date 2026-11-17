import { useState } from 'react';
import { X } from 'lucide-react';
import { MIDDLE_SCHOOL_WORRIES } from '../../data/chapters';
import { ISLANDS } from '../../data/islands';
import { FourSData, SavedWritingRecord } from '../../types/game';
import { WritingBox } from './WritingBox';

interface Transition4SModalProps {
  isOpen: boolean;
  fourS: FourSData;
  onChangeFourS: (next: FourSData) => void;
  onWritingSubmitted: (record: SavedWritingRecord) => void;
  onClose: () => void;
}

const FOUR_S_FIELDS: { key: keyof FourSData; label: string; hint: string }[] = [
  { key: 'situation', label: '상황 (Situation)', hint: '내가 마주한 걱정이나 변화는 무엇인가요?' },
  { key: 'self', label: '나 (Self)', hint: '내가 가진 강점이나 마음가짐은?' },
  { key: 'support', label: '도움 (Support)', hint: '힘이 되어 주는 사람이나 곳은?' },
  { key: 'strategy', label: '방법 (Strategy)', hint: '어떻게 한 걸음 내디뎌 볼까요?' },
];

export function Transition4SModal({
  isOpen,
  fourS,
  onChangeFourS,
  onWritingSubmitted,
  onClose,
}: Transition4SModalProps) {
  const [tab, setTab] = useState<'fours' | 'writing'>('fours');

  if (!isOpen) return null;

  const lighthousePrompt = ISLANDS[1].writingPrompt;

  return (
    <div
      className="fixed inset-0 z-30 flex items-start sm:items-center justify-center p-3 sm:p-6 bg-[#172033]/55"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] overflow-y-auto paper-scroll bg-[#F7F3EA] text-[#172033] rounded-2xl shadow-2xl border border-[#ECE4D3] p-4 sm:p-7 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#172033]/10">
          <div>
            <p className="text-xs font-semibold text-[#236B67]">2장 전환의 등대 섬</p>
            <h2 className="font-display text-lg sm:text-xl font-bold mt-0.5">
              중학교 전환 준비 · 4S 네 칸 정리하기
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab('fours')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold border cursor-pointer ${
              tab === 'fours'
                ? 'bg-[#172033] text-[#F7F3EA] border-[#172033]'
                : 'bg-[#ECE4D3] text-[#172033] border-[#172033]/15'
            }`}
          >
            4S 네 칸
          </button>
          <button
            type="button"
            onClick={() => setTab('writing')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold border cursor-pointer ${
              tab === 'writing'
                ? 'bg-[#172033] text-[#F7F3EA] border-[#172033]'
                : 'bg-[#ECE4D3] text-[#172033] border-[#172033]/15'
            }`}
          >
            등대 글쓰기
          </button>
        </div>

        {tab === 'fours' ? (
          <div className="space-y-3">
            {/* Quick-pick middle school concern chips */}
            <div className="p-3 rounded-xl bg-[#ECE4D3]/65 border border-[#172033]/10 space-y-2">
              <p className="text-xs font-bold text-[#172033]">
                중학교를 생각할 때 가장 마음에 걸리는 걱정 고르기 (누르면 상황 칸에 들어가요)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {MIDDLE_SCHOOL_WORRIES.map((worry) => {
                  const active = fourS.situation === worry;
                  return (
                    <button
                      key={worry}
                      type="button"
                      onClick={() => onChangeFourS({ ...fourS, situation: worry })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#236B67] text-[#F7F3EA] border-[#236B67]'
                          : 'bg-[#F7F3EA] text-[#172033] border-[#172033]/15 hover:bg-white'
                      }`}
                    >
                      {worry}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FOUR_S_FIELDS.map((field) => (
                <div
                  key={field.key}
                  className="p-3 rounded-xl bg-white border border-[#172033]/15 space-y-1.5"
                >
                  <label
                    htmlFor={`fours-${field.key}`}
                    className="block text-xs font-bold text-[#236B67]"
                  >
                    {field.label}
                  </label>
                  <textarea
                    id={`fours-${field.key}`}
                    rows={3}
                    maxLength={120}
                    value={fourS[field.key]}
                    placeholder={field.hint}
                    onChange={(e) =>
                      onChangeFourS({ ...fourS, [field.key]: e.target.value })
                    }
                    className="w-full text-xs sm:text-sm text-[#172033] bg-[#F7F3EA]/55 rounded-lg p-2 border border-[#172033]/10 resize-none focus:outline-none focus:ring-2 focus:ring-[#236B67]"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#E8A33D] hover:bg-[#DC9630] text-[#172033] text-sm font-bold cursor-pointer"
              >
                저장하고 돌아가기
              </button>
            </div>
          </div>
        ) : (
          <WritingBox
            isOpen
            embedded
            prompt={lighthousePrompt}
            onClose={onClose}
            onSubmitted={(record) => {
              onWritingSubmitted(record);
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
}
