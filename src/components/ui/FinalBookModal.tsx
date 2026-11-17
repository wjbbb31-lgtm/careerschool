import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Printer,
  RotateCcw,
  X,
} from 'lucide-react';
import {
  BookCoverPage,
  BookDataSnapshot,
  BookPage1,
  BookPage2,
  BookPage3,
  BookPage4,
} from './BookPages';

export type EditableChapterId = 'ch1' | 'ch2' | 'ch3' | 'ch4';

interface FinalBookModalProps {
  isOpen: boolean;
  data: BookDataSnapshot;
  sheetSaveFailed?: boolean;
  onEditChapter: (chapter: EditableChapterId) => void;
  onReplay3DBook: () => void;
  onClose: () => void;
}

export function FinalBookModal({
  isOpen,
  data,
  sheetSaveFailed = false,
  onEditChapter,
  onReplay3DBook,
  onClose,
}: FinalBookModalProps) {
  // spread 0: Cover, spread 1: Page 1 & 2, spread 2: Page 3 & 4
  const [spread, setSpread] = useState<0 | 1 | 2>(0);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportNote, setExportNote] = useState<string | null>(null);

  const exportCoverRef = useRef<HTMLDivElement>(null);
  const exportP1Ref = useRef<HTMLDivElement>(null);
  const exportP2Ref = useRef<HTMLDivElement>(null);
  const exportP3Ref = useRef<HTMLDivElement>(null);
  const exportP4Ref = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleSaveImages = async () => {
    if (exporting) return;
    setExporting(true);
    setExportNote('페이지별 이미지를 만들고 있어요...');

    const pages = [
      { ref: exportCoverRef, filename: '나의다음페이지_표지.png' },
      { ref: exportP1Ref, filename: '나의다음페이지_1쪽_흥미의장.png' },
      { ref: exportP2Ref, filename: '나의다음페이지_2쪽_전환의장.png' },
      { ref: exportP3Ref, filename: '나의다음페이지_3쪽_우연의장.png' },
      { ref: exportP4Ref, filename: '나의다음페이지_4쪽_다음페이지.png' },
    ];

    try {
      for (const item of pages) {
        if (!item.ref.current) continue;
        const canvas = await html2canvas(item.ref.current, {
          scale: 2,
          backgroundColor: null,
          useCORS: true,
        });
        const link = document.createElement('a');
        link.download = item.filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
        await new Promise((r) => setTimeout(r, 180));
      }
      setExportNote('표지와 1~4쪽 PNG 이미지가 모두 저장되었어요!');
    } catch {
      setExportNote('이미지 저장 중 문제가 생겼어요. 다시 한 번 눌러 보세요.');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Interactive Screen Book Modal */}
      <div
        className="fixed inset-0 z-30 flex items-start sm:items-center justify-center p-3 sm:p-5 bg-[#172033]/65 no-print overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="w-full max-w-5xl max-h-[calc(100dvh-1.5rem)] overflow-y-auto paper-scroll bg-[#F7F3EA] text-[#172033] rounded-2xl shadow-2xl border border-[#ECE4D3] p-4 sm:p-6 my-auto flex flex-col gap-4">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#172033]/10">
            <div>
              <p className="text-xs font-semibold text-[#236B67]">완성된 나의 진로 책</p>
              <h2 className="font-display text-lg sm:text-2xl font-bold text-[#172033]">
                「{data.ch4State.bookTitle || '나의 다음 페이지'}」
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onReplay3DBook}
                className="px-3 py-2 rounded-xl bg-[#ECE4D3] hover:bg-[#E2D8C4] text-[#172033] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>3D 책 다시 보기</span>
              </button>

              <button
                type="button"
                onClick={() => setShowEditMenu((v) => !v)}
                className="px-3 py-2 rounded-xl bg-[#ECE4D3] hover:bg-[#E2D8C4] text-[#172033] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>글 고치기</span>
              </button>

              <button
                type="button"
                onClick={handleSaveImages}
                disabled={exporting}
                className="px-3.5 py-2 rounded-xl bg-[#236B67] hover:bg-[#1C5854] disabled:opacity-60 text-[#F7F3EA] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{exporting ? '저장 중...' : '책 이미지로 저장'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-[#E8A33D] hover:bg-[#DC9630] text-[#172033] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>인쇄하기</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="책 닫기"
                className="p-2 rounded-lg text-[#172033]/70 hover:bg-[#ECE4D3] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chapter Edit Selector Drawer */}
          {showEditMenu && (
            <div className="p-3.5 rounded-xl bg-[#ECE4D3]/70 border border-[#172033]/12 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#172033]">
                어느 장의 글이나 선택을 고칠까요?
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onEditChapter('ch1')}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F7F3EA] border border-[#172033]/15 text-xs font-semibold cursor-pointer"
                >
                  1쪽 · 흥미의 장
                </button>
                <button
                  type="button"
                  onClick={() => onEditChapter('ch2')}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F7F3EA] border border-[#172033]/15 text-xs font-semibold cursor-pointer"
                >
                  2쪽 · 전환의 장 (4S)
                </button>
                <button
                  type="button"
                  onClick={() => onEditChapter('ch3')}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F7F3EA] border border-[#172033]/15 text-xs font-semibold cursor-pointer"
                >
                  3쪽 · 우연의 장
                </button>
                <button
                  type="button"
                  onClick={() => onEditChapter('ch4')}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F7F3EA] border border-[#172033]/15 text-xs font-semibold cursor-pointer"
                >
                  4쪽 · 제목·첫 문장·편지
                </button>
              </div>
            </div>
          )}

          {sheetSaveFailed && (
            <div className="px-3.5 py-2.5 rounded-xl bg-[#E8A33D]/15 border border-[#E8A33D]/40 text-xs sm:text-sm font-semibold text-[#172033]">
              책은 내 기기에 잘 저장됐어요. 이미지로 저장해 두세요
            </div>
          )}

          {exportNote && (
            <div className="px-3.5 py-2 rounded-xl bg-[#236B67]/12 border border-[#236B67]/25 text-xs font-medium text-[#1B5350]">
              {exportNote}
            </div>
          )}

          {/* Book Spread Display */}
          <div className="py-1">
            {spread === 0 && (
              <div className="max-w-md mx-auto">
                <BookCoverPage data={data} />
              </div>
            )}

            {spread === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 bg-[#E6DEC9] p-3 sm:p-4 rounded-2xl border border-[#CFC4AC] shadow-inner">
                <BookPage1 data={data} />
                <BookPage2 data={data} />
              </div>
            )}

            {spread === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 bg-[#E6DEC9] p-3 sm:p-4 rounded-2xl border border-[#CFC4AC] shadow-inner">
                <BookPage3 data={data} />
                <BookPage4 data={data} />
              </div>
            )}
          </div>

          {/* Page Flip Navigation */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#172033]/10">
            <button
              type="button"
              disabled={spread === 0}
              onClick={() => setSpread((s) => (s > 0 ? ((s - 1) as 0 | 1 | 2) : s))}
              className="px-4 py-2 rounded-xl bg-[#ECE4D3] hover:bg-[#E2D8C4] disabled:opacity-40 text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer disabled:cursor-default"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>앞 페이지 넘기기</span>
            </button>

            <div className="flex items-center gap-1.5">
              {[
                { id: 0 as const, label: '표지' },
                { id: 1 as const, label: '1~2쪽' },
                { id: 2 as const, label: '3~4쪽' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSpread(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    spread === item.id
                      ? 'bg-[#172033] text-[#F7F3EA]'
                      : 'bg-[#ECE4D3] text-[#172033] hover:bg-[#E2D8C4]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={spread === 2}
              onClick={() => setSpread((s) => (s < 2 ? ((s + 1) as 0 | 1 | 2) : s))}
              className="px-4 py-2 rounded-xl bg-[#E8A33D] hover:bg-[#DC9630] disabled:opacity-40 text-[#172033] text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer disabled:cursor-default"
            >
              <span>뒤 페이지 넘기기</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Off-screen Pure-Hex Export Nodes for html2canvas (zero oklch colors) */}
      <div
        aria-hidden="true"
        className="no-print"
        style={{
          position: 'fixed',
          left: -9999,
          top: 0,
          pointerEvents: 'none',
          opacity: 1,
        }}
      >
        <div ref={exportCoverRef} style={{ width: 540, height: 720, padding: 12, backgroundColor: '#ECE4D3' }}>
          <BookCoverPage data={data} width={516} height={696} />
        </div>
        <div ref={exportP1Ref} style={{ width: 540, height: 720, padding: 12, backgroundColor: '#ECE4D3' }}>
          <BookPage1 data={data} width={516} height={696} />
        </div>
        <div ref={exportP2Ref} style={{ width: 540, height: 720, padding: 12, backgroundColor: '#ECE4D3' }}>
          <BookPage2 data={data} width={516} height={696} />
        </div>
        <div ref={exportP3Ref} style={{ width: 540, height: 720, padding: 12, backgroundColor: '#ECE4D3' }}>
          <BookPage3 data={data} width={516} height={696} />
        </div>
        <div ref={exportP4Ref} style={{ width: 540, height: 720, padding: 12, backgroundColor: '#ECE4D3' }}>
          <BookPage4 data={data} width={516} height={696} />
        </div>
      </div>

      {/* Print-Only A4 Landscape 2-Page Spreads */}
      <div className="hidden print-only-book">
        <div className="print-spread">
          <BookCoverPage data={data} />
          <div
            style={{
              backgroundColor: '#F7F3EA',
              borderRadius: 12,
              border: '1px solid #D8CCB8',
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              color: '#172033',
            }}
          >
            <p style={{ fontSize: 13, color: '#236B67', fontWeight: 700, marginBottom: 8 }}>
              5~6학년 전환기 교육 · 나의 다음 페이지를 열다
            </p>
            <h3 style={{ fontFamily: "'Gowun Batang', serif", fontSize: 22, fontWeight: 700, margin: '0 0 12px' }}>
              {data.ch4State.bookTitle || '나의 다음 페이지'}
            </h3>
            <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 280, color: '#4A5568' }}>
              초등학교에서의 소중한 경험과 배움을 품고, 나만의 속도로 새로운 중학교 이야기를 펼쳐 나갑니다.
            </p>
          </div>
        </div>
        <div className="print-spread">
          <BookPage1 data={data} />
          <BookPage2 data={data} />
        </div>
        <div className="print-spread">
          <BookPage3 data={data} />
          <BookPage4 data={data} />
        </div>
      </div>
    </>
  );
}
