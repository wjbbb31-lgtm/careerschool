import { useEffect, useState } from 'react';
import { Lock, X } from 'lucide-react';

const TEACHER_PASSWORD = '0000';

interface TeacherLoginModalProps {
  isOpen: boolean;
  defaultClassCode: string;
  onSuccess: (classCode: string) => void;
  onClose: () => void;
}

export function TeacherLoginModal({
  isOpen,
  defaultClassCode,
  onSuccess,
  onClose,
}: TeacherLoginModalProps) {
  const [classCode, setClassCode] = useState(defaultClassCode);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setClassCode(defaultClassCode);
      setPin('');
      setError(null);
    }
  }, [isOpen, defaultClassCode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = classCode.trim().toUpperCase();
    if (!cleanCode) {
      setError('수업 코드를 입력해 주세요.');
      return;
    }
    if (pin !== TEACHER_PASSWORD) {
      setError('비밀번호가 맞지 않아요.');
      return;
    }
    setError(null);
    onSuccess(cleanCode);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[#172033]/70"
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#F7F3EA] text-[#172033] rounded-2xl shadow-2xl border border-[#ECE4D3] p-6 space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[#236B67]">선생님 전용</p>
            <h2 className="font-display text-xl font-bold mt-0.5">우리 반 서재 열기</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="p-1.5 rounded-lg text-[#172033]/70 hover:bg-[#ECE4D3] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="teacher-class-code" className="block text-xs font-bold mb-1">
              수업 코드
            </label>
            <input
              id="teacher-class-code"
              type="text"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              placeholder="예: A3"
              maxLength={12}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#172033]/15 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#236B67]"
            />
          </div>

          <div>
            <label htmlFor="teacher-pin" className="block text-xs font-bold mb-1">
              4자리 비밀번호
            </label>
            <input
              id="teacher-pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="4자리 숫자"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#172033]/15 text-sm font-semibold tracking-widest focus:outline-none focus:ring-2 focus:ring-[#236B67]"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs font-semibold text-[#8F2E24] bg-[#B5463A]/10 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#ECE4D3] text-sm font-medium cursor-pointer"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-[#236B67] hover:bg-[#1C5854] text-[#F7F3EA] text-sm font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>입장하기</span>
          </button>
        </div>
      </form>
    </div>
  );
}
