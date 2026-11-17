import { Compass, PenLine } from 'lucide-react';

interface WebGLFallbackProps {
  reason: 'unsupported' | 'context-lost';
  onOpenSampleWriting: () => void;
}

export function WebGLFallback({ reason, onOpenSampleWriting }: WebGLFallbackProps) {
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center p-4 bg-[#172033] text-[#F7F3EA]">
      <div className="w-full max-w-lg bg-[#F7F3EA] text-[#172033] rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#ECE4D3]">
        <div className="flex items-center gap-2 text-[#236B67] text-sm font-semibold">
          <Compass className="w-4 h-4" />
          <span>3D 화면 안내</span>
        </div>
        <h2 className="font-display text-2xl font-bold mt-2">
          {reason === 'context-lost'
            ? '잠시 3D 화면 연결이 끊어졌어요'
            : '이 기기에서는 3D 화면(WebGL)을 열기 어려워요'}
        </h2>
        <p className="mt-3 text-sm text-[#172033]/80 leading-relaxed">
          크롬북이나 태블릿의 브라우저 설정에서 하드웨어 가속이 꺼져 있거나, WebGL을 지원하지 않는 환경일 수 있어요.
          페이지를 새로고침하거나 크롬(Chrome) 브라우저로 다시 열어 보세요.
        </p>
        <div className="mt-5 p-3.5 rounded-xl bg-[#ECE4D3] text-xs text-[#172033]/85 leading-relaxed">
          3D 바다가 보이지 않아도 오늘의 글쓰기 활동은 바로 이어서 할 수 있어요.
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2.5 rounded-xl bg-[#172033] text-[#F7F3EA] text-sm font-medium cursor-pointer"
          >
            새로고침 하기
          </button>
          <button
            type="button"
            onClick={onOpenSampleWriting}
            className="px-4 py-2.5 rounded-xl bg-[#E8A33D] text-[#172033] text-sm font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <PenLine className="w-4 h-4" />
            <span>글쓰기 상자 열기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
