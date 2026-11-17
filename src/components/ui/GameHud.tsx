import { Anchor, BookOpen, Cpu, PenLine, Sparkles, UserCog } from 'lucide-react';
import { ISLANDS } from '../../data/islands';
import { IslandId, PlayerProfile } from '../../types/game';

interface GameHudProps {
  profile: PlayerProfile;
  currentIslandId: IslandId;
  sailingTargetId: IslandId | null;
  lowSpec: boolean;
  ch3Completed: boolean;
  ch4Completed: boolean;
  nearLibraryBook: boolean;
  finaleAnimating: boolean;
  onSelectIsland: (islandId: IslandId) => void;
  onOpenIslandActivity: (islandId: IslandId) => void;
  onOpenFinalBook: () => void;
  onToggleLowSpec: () => void;
  onReopenStart: () => void;
}

export function GameHud({
  profile,
  currentIslandId,
  sailingTargetId,
  lowSpec,
  ch3Completed,
  ch4Completed,
  nearLibraryBook,
  finaleAnimating,
  onSelectIsland,
  onOpenIslandActivity,
  onOpenFinalBook,
  onToggleLowSpec,
  onReopenStart,
}: GameHudProps) {
  const currentIsland = ISLANDS.find((i) => i.id === currentIslandId) ?? ISLANDS[0];
  const isSailing = sailingTargetId !== null;

  const getPrimaryActionLabel = () => {
    if (currentIslandId === 'interest') return '1장 흥미 기록하기';
    if (currentIslandId === 'lighthouse') return '2장 전환 4S 기록하기';
    if (currentIslandId === 'serendipity') {
      return ch3Completed ? '3장 우연의 기록 보기' : '유리병 열어 보기';
    }
    if (ch4Completed) return '4장 내용 다시 쓰기';
    return nearLibraryBook ? '큰 책 앞에서 페이지 열기' : '4장 나의 다음 페이지 쓰기';
  };

  return (
    <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between p-3 sm:p-5 no-print">
      {/* Top Bar */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        {/* Location & Student Info */}
        <div className="pointer-events-auto bg-[#172033]/88 text-[#F7F3EA] border border-[#ECE4D3]/20 rounded-xl px-4 py-2.5 shadow-lg">
          <div className="flex items-center gap-2 text-xs text-[#ECE4D3]/80">
            <span>{profile.nickname}</span>
            {profile.classCode && (
              <>
                <span aria-hidden="true">·</span>
                <span>수업 {profile.classCode}</span>
              </>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="font-display text-base sm:text-lg font-bold text-[#F7F3EA]">
              {finaleAnimating
                ? '서재의 책이 손으로 내려오고 있어요...'
                : isSailing
                  ? `${ISLANDS.find((i) => i.id === sailingTargetId)?.name}(으)로 배 타고 이동 중`
                  : `${currentIsland.orderLabel}. ${currentIsland.name}`}
            </span>
          </div>
        </div>

        {/* Right Controls */}
        {!finaleAnimating && (
          <div className="pointer-events-auto flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenIslandActivity(currentIslandId)}
              disabled={isSailing}
              className="px-3.5 py-2 rounded-xl bg-[#E8A33D] hover:bg-[#DC9630] disabled:opacity-50 text-[#172033] text-xs sm:text-sm font-bold shadow-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              {currentIslandId === 'serendipity' && !ch3Completed ? (
                <Sparkles className="w-4 h-4" />
              ) : (
                <PenLine className="w-4 h-4" />
              )}
              <span>{getPrimaryActionLabel()}</span>
            </button>

            {ch4Completed && (
              <button
                type="button"
                onClick={onOpenFinalBook}
                disabled={isSailing}
                className="px-3.5 py-2 rounded-xl bg-[#236B67] hover:bg-[#1C5854] text-[#F7F3EA] text-xs sm:text-sm font-bold border border-[#ECE4D3]/25 shadow-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>완성한 책 보기</span>
              </button>
            )}

            <button
              type="button"
              onClick={onToggleLowSpec}
              aria-pressed={lowSpec}
              className={`px-3 py-2 rounded-xl text-xs font-medium border shadow-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                lowSpec
                  ? 'bg-[#236B67] text-[#F7F3EA] border-[#ECE4D3]/30'
                  : 'bg-[#172033]/88 text-[#ECE4D3] border-[#ECE4D3]/20 hover:bg-[#1F2C45]'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>{lowSpec ? '저사양 켜짐' : '저사양 모드'}</span>
            </button>

            <button
              type="button"
              onClick={onReopenStart}
              className="px-3 py-2 rounded-xl bg-[#172033]/88 hover:bg-[#1F2C45] text-[#ECE4D3] text-xs font-medium border border-[#ECE4D3]/20 shadow-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <UserCog className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">별명·모습</span>
            </button>
          </div>
        )}
      </div>

      {/* Contextual Floating Prompt on Serendipity / Library */}
      {!isSailing && !finaleAnimating && currentIslandId === 'serendipity' && !ch3Completed && (
        <div className="flex justify-center pointer-events-none">
          <button
            type="button"
            onClick={() => onOpenIslandActivity('serendipity')}
            className="pointer-events-auto px-4 py-2.5 rounded-xl bg-[#F7F3EA]/95 text-[#172033] border border-[#E8A33D] shadow-xl text-xs sm:text-sm font-semibold flex items-center gap-2 hover:bg-white cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#E8A33D]" />
            <span>바다에 유리병이 다가왔어요! 눌러서 열어 보세요</span>
          </button>
        </div>
      )}

      {!isSailing && !finaleAnimating && currentIslandId === 'library' && nearLibraryBook && !ch4Completed && (
        <div className="flex justify-center pointer-events-none">
          <button
            type="button"
            onClick={() => onOpenIslandActivity('library')}
            className="pointer-events-auto px-4 py-2.5 rounded-xl bg-[#F7F3EA]/95 text-[#172033] border border-[#E8A33D] shadow-xl text-xs sm:text-sm font-semibold flex items-center gap-2 hover:bg-white cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#236B67]" />
            <span>큰 책의 페이지가 넘어가고 있어요 · 나의 다음 페이지 열기</span>
          </button>
        </div>
      )}

      {/* Bottom Island Dock & Control Hint */}
      {!finaleAnimating && (
        <div className="flex flex-col items-center gap-2">
          <div className="pointer-events-auto max-w-full overflow-x-auto bg-[#172033]/90 border border-[#ECE4D3]/20 rounded-xl p-1.5 shadow-xl flex items-center gap-1.5">
            <span className="hidden md:flex items-center gap-1 px-2.5 text-xs text-[#ECE4D3]/75 whitespace-nowrap">
              <Anchor className="w-3.5 h-3.5 text-[#E8A33D]" />
              <span>배 타고 이동</span>
            </span>
            {ISLANDS.map((island) => {
              const active = island.id === currentIslandId && !isSailing;
              const sailingHere = island.id === sailingTargetId;
              return (
                <button
                  key={island.id}
                  type="button"
                  disabled={isSailing}
                  onClick={() => onSelectIsland(island.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-default ${
                    active
                      ? 'bg-[#E8A33D] text-[#172033] font-bold'
                      : sailingHere
                        ? 'bg-[#236B67] text-[#F7F3EA]'
                        : 'text-[#F7F3EA]/85 hover:bg-white/10'
                  }`}
                >
                  {island.orderLabel}. {island.name}
                </button>
              );
            })}
          </div>

          <p className="text-[11px] sm:text-xs text-[#ECE4D3]/85 bg-[#172033]/75 px-3 py-1 rounded-lg border border-[#ECE4D3]/10 text-center">
            섬 땅을 터치하거나 방향키·WASD로 걸어가요 · 다른 섬을 누르면 나무배를 타고 이동해요
          </p>
        </div>
      )}
    </div>
  );
}
