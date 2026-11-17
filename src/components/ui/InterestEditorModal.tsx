import { useState } from 'react';
import { X } from 'lucide-react';
import { getTopHollandCode, HOLLAND_META } from '../../data/chapters';
import { ISLANDS } from '../../data/islands';
import { HollandScores, HollandTypeId, SavedWritingRecord } from '../../types/game';
import { HexagonChart } from './HexagonChart';
import { WritingBox } from './WritingBox';

interface InterestEditorModalProps {
  isOpen: boolean;
  scores: HollandScores;
  onChangeScores: (scores: HollandScores) => void;
  onWritingSubmitted: (record: SavedWritingRecord) => void;
  onClose: () => void;
}

export function InterestEditorModal({
  isOpen,
  scores,
  onChangeScores,
  onWritingSubmitted,
  onClose,
}: InterestEditorModalProps) {
  const [tab, setTab] = useState<'writing' | 'hexagon'>('writing');

  if (!isOpen) return null;

  const interestPrompt = ISLANDS[0].writingPrompt;
  const topCode = getTopHollandCode(scores);

  const handleScoreChange = (id: HollandTypeId, val: number) => {
    onChangeScores({ ...scores, [id]: val });
  };

  return (
    <div
      className="fixed inset-0 z-30 flex items-start sm:items-center justify-center p-3 sm:p-6 bg-[#172033]/55"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] overflow-y-auto paper-scroll bg-[#F7F3EA] text-[#172033] rounded-2xl shadow-2xl border border-[#ECE4D3] p-4 sm:p-7 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#172033]/10">
          <div>
            <p className="text-xs font-semibold text-[#236B67]">1장 흥미의 섬</p>
            <h2 className="font-display text-lg sm:text-xl font-bold mt-0.5">
              나의 흥미 코드와 생각 기록하기
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
            onClick={() => setTab('writing')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold border cursor-pointer ${
              tab === 'writing'
                ? 'bg-[#172033] text-[#F7F3EA] border-[#172033]'
                : 'bg-[#ECE4D3] text-[#172033] border-[#172033]/15'
            }`}
          >
            글쓰기 ①
          </button>
          <button
            type="button"
            onClick={() => setTab('hexagon')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold border cursor-pointer ${
              tab === 'hexagon'
                ? 'bg-[#172033] text-[#F7F3EA] border-[#172033]'
                : 'bg-[#ECE4D3] text-[#172033] border-[#172033]/15'
            }`}
          >
            흥미 코드 · 육각형 ({topCode})
          </button>
        </div>

        {tab === 'writing' ? (
          <WritingBox
            isOpen
            embedded
            prompt={interestPrompt}
            onClose={onClose}
            onSubmitted={(record) => {
              onWritingSubmitted(record);
              onClose();
            }}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-[#ECE4D3]/60 border border-[#172033]/10">
              <div className="shrink-0">
                <HexagonChart scores={scores} size={168} />
              </div>
              <div className="flex-1 w-full space-y-2.5">
                {HOLLAND_META.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#172033]">{item.label}</p>
                      <p className="text-[11px] text-[#172033]/65 truncate">{item.hint}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => handleScoreChange(item.id, n)}
                          className={`w-7 h-7 rounded-md text-xs font-bold border cursor-pointer transition-colors ${
                            scores[item.id] === n
                              ? 'bg-[#236B67] text-[#F7F3EA] border-[#236B67]'
                              : 'bg-white text-[#172033] border-[#172033]/15 hover:bg-[#ECE4D3]'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#E8A33D] hover:bg-[#DC9630] text-[#172033] text-sm font-bold cursor-pointer"
              >
                저장하고 돌아가기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
