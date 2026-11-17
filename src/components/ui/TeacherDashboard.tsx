import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, Lock, RefreshCw, Users, X } from 'lucide-react';
import { HOLLAND_META } from '../../data/chapters';
import { HollandScores, HollandTypeId } from '../../types/game';
import { fetchClassBooksFromSheetDB, SheetRowPayload } from '../../utils/sheetClient';
import { TeacherStudyCanvas } from '../three/TeacherStudyCanvas';
import { HexagonChart } from './HexagonChart';

const POLL_INTERVAL_MS = 15000;

const SPINE_COLOR_MAP: Record<HollandTypeId, string> = {
  R: '#B56357',
  I: '#236B67',
  A: '#E8A33D',
  S: '#4B725B',
  E: '#344970',
  C: '#8D735B',
};

interface TeacherDashboardProps {
  classCode: string;
  lowSpec: boolean;
  isTouchDevice: boolean;
  isSoftwareGl: boolean;
  webglSupported: boolean;
  onExit: () => void;
}

export function TeacherDashboard({
  classCode,
  lowSpec,
  isTouchDevice,
  isSoftwareGl,
  webglSupported,
  onExit,
}: TeacherDashboardProps) {
  const [books, setBooks] = useState<SheetRowPayload[]>([]);
  const [newBookKeys, setNewBookKeys] = useState<Set<string>>(new Set());
  const [selectedBook, setSelectedBook] = useState<SheetRowPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);

  const seenKeysRef = useRef<Set<string>>(new Set());
  const isFirstFetchRef = useRef(true);
  const isFetchingRef = useRef(false);

  const loadBooks = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);

    const result = await fetchClassBooksFromSheetDB(classCode);
    isFetchingRef.current = false;
    setIsLoading(false);

    if (!result.ok) {
      setFetchErrorMsg('잠시 후 다시 불러올게요');
      return;
    }

    setFetchErrorMsg(null);
    const incoming = result.rows;
    const newlyArrived = new Set<string>();

    for (const row of incoming) {
      const key = `${row.nickname}::${row.created_at}`;
      if (!isFirstFetchRef.current && !seenKeysRef.current.has(key)) {
        newlyArrived.add(key);
      }
      seenKeysRef.current.add(key);
    }

    isFirstFetchRef.current = false;
    if (newlyArrived.size > 0) {
      setNewBookKeys(newlyArrived);
    }
    setBooks(incoming);
  }, [classCode]);

  // 15s polling paused automatically when tab is hidden
  useEffect(() => {
    let timerId: number | null = null;

    const startPolling = () => {
      if (timerId !== null) window.clearInterval(timerId);
      if (document.visibilityState === 'visible') {
        timerId = window.setInterval(() => {
          if (document.visibilityState === 'visible') {
            void loadBooks();
          }
        }, POLL_INTERVAL_MS);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startPolling();
      } else if (timerId !== null) {
        window.clearInterval(timerId);
        timerId = null;
      }
    };

    void loadBooks();
    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerId !== null) window.clearInterval(timerId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadBooks]);

  // Compute class distributions & rankings
  const analytics = useMemo(() => {
    const hollandCounts: Record<HollandTypeId, number> = {
      R: 0,
      I: 0,
      A: 0,
      S: 0,
      E: 0,
      C: 0,
    };
    const worryCounts = new Map<string, number>();
    const attitudeCounts = new Map<string, number>();

    for (const row of books) {
      const firstCode = (row.holland_code || '').trim().charAt(0).toUpperCase() as HollandTypeId;
      if (firstCode in hollandCounts) {
        hollandCounts[firstCode] += 1;
      }

      const worry = (row.s_situation || '').trim();
      if (worry) {
        worryCounts.set(worry, (worryCounts.get(worry) ?? 0) + 1);
      }

      const att = (row.chance_attitude || '').trim();
      if (att) {
        attitudeCounts.set(att, (attitudeCounts.get(att) ?? 0) + 1);
      }
    }

    const maxHollandCount = Math.max(1, ...Object.values(hollandCounts));
    const normalizedHexScores: HollandScores = {
      R: Math.max(1, Math.round((hollandCounts.R / maxHollandCount) * 4) + 1),
      I: Math.max(1, Math.round((hollandCounts.I / maxHollandCount) * 4) + 1),
      A: Math.max(1, Math.round((hollandCounts.A / maxHollandCount) * 4) + 1),
      S: Math.max(1, Math.round((hollandCounts.S / maxHollandCount) * 4) + 1),
      E: Math.max(1, Math.round((hollandCounts.E / maxHollandCount) * 4) + 1),
      C: Math.max(1, Math.round((hollandCounts.C / maxHollandCount) * 4) + 1),
    };

    const worryRank = Array.from(worryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    const attitudeRank = Array.from(attitudeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      hollandCounts,
      maxHollandCount,
      normalizedHexScores,
      worryRank,
      attitudeRank,
    };
  }, [books]);

  return (
    <div className="fixed inset-0 z-20 flex flex-col lg:flex-row bg-[#172033] text-[#F7F3EA]">
      {/* Left: 3D Study Viewport */}
      <div className="relative flex-1 min-h-[45vh] lg:min-h-0">
        {webglSupported ? (
          <TeacherStudyCanvas
            books={books}
            newBookKeys={newBookKeys}
            selectedNickname={selectedBook?.nickname ?? null}
            lowSpec={lowSpec}
            isTouchDevice={isTouchDevice}
            isSoftwareGl={isSoftwareGl}
            onSelectBook={(row) => setSelectedBook(row)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-6 text-center text-sm text-[#ECE4D3]">
            3D 화면(WebGL)을 사용할 수 없는 기기입니다. 오른쪽 패널에서 반 통계를 확인할 수 있어요.
          </div>
        )}

        {/* Top-left Study Header */}
        <div className="absolute top-3 left-3 sm:top-5 sm:left-5 flex flex-wrap items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={onExit}
            className="px-3.5 py-2 rounded-xl bg-[#172033]/90 hover:bg-[#1E2A42] text-[#F7F3EA] text-xs sm:text-sm font-semibold border border-[#ECE4D3]/20 flex items-center gap-1.5 cursor-pointer shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>시작 화면</span>
          </button>

          <div className="px-4 py-2 rounded-xl bg-[#172033]/90 text-[#F7F3EA] border border-[#ECE4D3]/20 shadow-lg">
            <span className="font-display text-sm sm:text-base font-bold">
              우리 반 서재 · 수업 {classCode}
            </span>
          </div>
        </div>

        {/* Bottom-left instruction */}
        <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 pointer-events-none">
          <p className="text-xs text-[#ECE4D3]/85 bg-[#172033]/80 px-3.5 py-1.5 rounded-lg border border-[#ECE4D3]/15">
            책장의 책을 클릭하면 나누기 발표 카드가 열려요 · 화면을 드래그해서 서재를 둘러볼 수 있어요
          </p>
        </div>

        {/* Presentation Spotlight Overlay when a book is clicked */}
        {selectedBook && (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-4 sm:p-8 bg-[#172033]/65">
            <div className="w-full max-w-xl bg-[#F7F3EA] text-[#172033] rounded-2xl shadow-2xl border-2 border-[#E8A33D] p-6 sm:p-8 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-[#236B67]">
                    {selectedBook.nickname} · 흥미 코드 {selectedBook.holland_code}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBook(null)}
                  aria-label="발표 카드 닫기"
                  className="p-2 rounded-lg text-[#172033]/70 hover:bg-[#ECE4D3] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedBook.share_ok === 'Y' ? (
                <div className="space-y-4 py-2">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#172033] leading-snug">
                    「{selectedBook.book_title || '나의 다음 페이지'}」
                  </h3>
                  <div className="p-5 rounded-xl bg-white border border-[#172033]/12">
                    <p className="text-xs font-bold text-[#E8A33D] mb-2">책의 첫 문장</p>
                    <p className="font-display text-xl sm:text-2xl text-[#172033] leading-relaxed">
                      &ldquo;{selectedBook.first_sentence}&rdquo;
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center space-y-2">
                  <Lock className="w-8 h-8 text-[#236B67] mx-auto" />
                  <p className="font-display text-2xl font-bold text-[#172033]">
                    선생님만 보는 책이에요
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedBook(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#172033] text-[#F7F3EA] text-sm font-bold cursor-pointer"
                >
                  책장으로 돌아가기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right: Large-Text Class Analytics Panel */}
      <aside className="w-full lg:w-[440px] xl:w-[480px] shrink-0 bg-[#F7F3EA] text-[#172033] border-t lg:border-t-0 lg:border-l border-[#ECE4D3] overflow-y-auto p-5 sm:p-6 space-y-5">
        {/* Controls Row */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#172033]/12">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#172033]">
              우리 반 현황
            </h2>
            {fetchErrorMsg && (
              <p className="text-xs font-semibold text-[#8F2E24] mt-0.5">{fetchErrorMsg}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => void loadBooks()}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-[#236B67] hover:bg-[#1C5854] disabled:opacity-60 text-[#F7F3EA] text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>지금 새로고침</span>
          </button>
        </div>

        {/* Participant Count */}
        <div className="p-4 rounded-xl bg-white border border-[#172033]/12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#E8A33D]/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-[#B6771B]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#172033]/75">참여 학생 수</p>
              <p className="text-xs text-[#172033]/55">15초마다 자동 새로고침</p>
            </div>
          </div>
          <span className="font-display text-3xl sm:text-4xl font-bold tabular-nums text-[#172033]">
            {books.length}명
          </span>
        </div>

        {/* Class Holland Distribution (Hexagon + Bars) */}
        <div className="p-4 rounded-xl bg-white border border-[#172033]/12 space-y-3">
          <h3 className="text-base sm:text-lg font-bold text-[#172033]">
            우리 반 흥미유형 분포
          </h3>
          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-4">
            <div className="shrink-0">
              <HexagonChart scores={analytics.normalizedHexScores} size={148} />
            </div>
            <div className="flex-1 w-full space-y-2">
              {HOLLAND_META.map((item) => {
                const count = analytics.hollandCounts[item.id];
                const pct = Math.round((count / analytics.maxHollandCount) * 100);
                return (
                  <div key={item.id} className="space-y-0.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                      <span>
                        {item.shortLabel}({item.code})
                      </span>
                      <span className="tabular-nums">{count}명</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[#ECE4D3] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${count > 0 ? Math.max(8, pct) : 0}%`,
                          backgroundColor: SPINE_COLOR_MAP[item.id],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Middle School Worry Ranking */}
        <div className="p-4 rounded-xl bg-white border border-[#172033]/12 space-y-2.5">
          <h3 className="text-base sm:text-lg font-bold text-[#172033]">
            가장 많이 고른 중학교 걱정 순위
          </h3>
          {analytics.worryRank.length === 0 ? (
            <p className="text-sm text-[#172033]/60">아직 도착한 책이 없어요.</p>
          ) : (
            <ol className="space-y-2">
              {analytics.worryRank.map(([label, count], idx) => (
                <li
                  key={label}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-[#F7F3EA]"
                >
                  <span className="text-sm sm:text-base font-semibold text-[#172033] truncate">
                    {idx + 1}위 · {label}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-[#236B67] shrink-0">
                    {count}명
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Serendipity Attitude Ranking */}
        <div className="p-4 rounded-xl bg-white border border-[#172033]/12 space-y-2.5">
          <h3 className="text-base sm:text-lg font-bold text-[#172033]">
            가장 많이 고른 태도 순위
          </h3>
          {analytics.attitudeRank.length === 0 ? (
            <p className="text-sm text-[#172033]/60">아직 도착한 책이 없어요.</p>
          ) : (
            <ol className="space-y-2">
              {analytics.attitudeRank.map(([label, count], idx) => (
                <li
                  key={label}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-[#F7F3EA]"
                >
                  <span className="text-sm sm:text-base font-semibold text-[#172033]">
                    {idx + 1}위 · {label}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-[#B6771B] shrink-0">
                    {count}명
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Quick Book List for Projector/Touch Accessibility */}
        {books.length > 0 && (
          <div className="p-4 rounded-xl bg-[#ECE4D3]/60 border border-[#172033]/10 space-y-2">
            <p className="text-xs font-bold text-[#172033]/75 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#236B67]" />
              <span>학생 책 바로 열기</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {books.map((row) => (
                <button
                  key={row.nickname}
                  type="button"
                  onClick={() => setSelectedBook(row)}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#F7F3EA] border border-[#172033]/15 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{
                      backgroundColor:
                        SPINE_COLOR_MAP[
                          ((row.holland_code || 'I').charAt(0).toUpperCase() as HollandTypeId) ||
                            'I'
                        ] ?? '#236B67',
                    }}
                  />
                  <span>{row.nickname}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
