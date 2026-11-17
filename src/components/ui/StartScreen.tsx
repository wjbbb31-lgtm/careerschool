import { RefreshCw, Sparkles, Compass, Cpu } from 'lucide-react';
import { HAIR_STYLE_OPTIONS, OUTFIT_COLOR_OPTIONS } from '../../data/islands';
import { HairStyleId, PlayerProfile } from '../../types/game';

interface StartScreenProps {
  profile: PlayerProfile;
  lowSpec: boolean;
  onUpdateProfile: (patch: Partial<PlayerProfile>) => void;
  onRerollNickname: () => void;
  onToggleLowSpec: () => void;
  onStart: () => void;
  onOpenTeacher: () => void;
}

function AvatarPortraitPreview({
  hairStyle,
  outfitColor,
}: {
  hairStyle: HairStyleId;
  outfitColor: string;
}) {
  return (
    <div className="w-20 h-20 rounded-xl bg-[#172033] border border-[#ECE4D3]/20 flex items-center justify-center shrink-0 overflow-hidden">
      <svg viewBox="0 0 80 80" className="w-16 h-16" aria-hidden="true">
        {/* Sweater / Torso */}
        <path d="M20 76 C20 56, 60 56, 60 76 Z" fill={outfitColor} />
        {/* White collar */}
        <path d="M32 58 L40 65 L48 58 Z" fill="#F7F3EA" />
        {/* Ponytail behind head */}
        {hairStyle === 'ponytail' && (
          <path d="M51 32 C61 32, 64 44, 58 53 C53 49, 51 40, 51 32 Z" fill="#2B211D" />
        )}
        {hairStyle === 'ponytail' && (
          <circle cx="53" cy="33" r="3" fill="#E8A33D" />
        )}
        {/* Bob back hair */}
        {hairStyle === 'bob' && (
          <rect x="21" y="23" width="38" height="30" rx="12" fill="#2B211D" />
        )}
        {/* Head */}
        <rect x="26" y="24" width="28" height="27" rx="9" fill="#F1CEB2" />
        {/* Eyes */}
        <circle cx="34" cy="39" r="2" fill="#1D222E" />
        <circle cx="46" cy="39" r="2" fill="#1D222E" />
        {/* Hair Bangs */}
        {hairStyle === 'bob' && (
          <path d="M24 27 C24 18, 56 18, 56 27 L55 34 L25 34 Z" fill="#2B211D" />
        )}
        {hairStyle === 'short' && (
          <path d="M24 28 C25 16, 56 17, 56 28 L52 31 L40 28 L27 32 Z" fill="#2B211D" />
        )}
        {hairStyle === 'ponytail' && (
          <path d="M25 27 C26 18, 55 18, 55 27 L47 31 L40 27 L33 31 Z" fill="#2B211D" />
        )}
      </svg>
    </div>
  );
}

export function StartScreen({
  profile,
  lowSpec,
  onUpdateProfile,
  onRerollNickname,
  onToggleLowSpec,
  onStart,
  onOpenTeacher,
}: StartScreenProps) {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center p-4 sm:p-6 bg-[#172033]/55 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#F7F3EA] text-[#172033] rounded-2xl shadow-2xl border border-[#ECE4D3] p-5 sm:p-8 my-auto">
        {/* Title Header */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#172033]/10">
          <div>
            <p className="text-xs sm:text-sm font-medium text-[#236B67]">
              5~6학년 전환기 교육 · 나의 다음 페이지를 열다
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#172033] mt-1">
              나의 다음 페이지
            </h1>
          </div>
          <button
            type="button"
            onClick={onToggleLowSpec}
            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              lowSpec
                ? 'bg-[#236B67] text-[#F7F3EA] border-[#236B67]'
                : 'bg-[#ECE4D3] text-[#172033] border-[#172033]/15 hover:bg-[#E2D8C4]'
            }`}
            aria-pressed={lowSpec}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{lowSpec ? '저사양 모드 켜짐' : '저사양 모드'}</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="mt-5 space-y-5">
          {/* Class Code + Nickname Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="class-code-input"
                className="block text-sm font-semibold text-[#172033] mb-1.5"
              >
                수업 코드
              </label>
              <input
                id="class-code-input"
                type="text"
                value={profile.classCode}
                onChange={(e) => onUpdateProfile({ classCode: e.target.value.toUpperCase() })}
                placeholder="예: A3"
                maxLength={12}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#172033]/15 text-[#172033] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#236B67]"
              />
              <p className="mt-1 text-xs text-[#172033]/65">
                선생님이 알려 준 반 코드를 입력해 주세요.
              </p>
            </div>

            <div>
              <span className="block text-sm font-semibold text-[#172033] mb-1.5">
                나의 항해 별명
              </span>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#ECE4D3]/70 border border-[#172033]/10 text-sm font-semibold text-[#172033] truncate">
                  {profile.nickname}
                </div>
                <button
                  type="button"
                  onClick={onRerollNickname}
                  className="px-3.5 py-2.5 rounded-xl bg-[#ECE4D3] hover:bg-[#E2D8C4] text-[#172033] text-sm font-medium border border-[#172033]/15 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>다시 뽑기</span>
                </button>
              </div>
              <p className="mt-1 text-xs text-[#172033]/65">
                실명 대신 나만의 별명으로 기록해요.
              </p>
            </div>
          </div>

          {/* Avatar Customization */}
          <div className="p-4 rounded-xl bg-[#ECE4D3]/55 border border-[#172033]/10">
            <div className="flex items-center gap-4">
              <AvatarPortraitPreview
                hairStyle={profile.hairStyle}
                outfitColor={profile.outfitColor}
              />
              <div className="flex-1 min-w-0 space-y-3">
                {/* Hairstyles */}
                <div>
                  <span className="block text-xs font-semibold text-[#172033]/80 mb-1.5">
                    머리 모양 (3가지)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {HAIR_STYLE_OPTIONS.map((opt) => {
                      const active = profile.hairStyle === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => onUpdateProfile({ hairStyle: opt.id })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap cursor-pointer ${
                            active
                              ? 'bg-[#172033] text-[#F7F3EA] border-[#172033]'
                              : 'bg-[#F7F3EA] text-[#172033] border-[#172033]/15 hover:bg-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Outfit Colors */}
                <div>
                  <span className="block text-xs font-semibold text-[#172033]/80 mb-1.5">
                    옷 색깔 (6가지)
                  </span>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {OUTFIT_COLOR_OPTIONS.map((color) => {
                      const active = profile.outfitColor === color.hex;
                      return (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => onUpdateProfile({ outfitColor: color.hex })}
                          aria-label={`옷 색깔 ${color.label}`}
                          title={color.label}
                          className={`w-8 h-8 rounded-lg border-2 transition-transform cursor-pointer flex items-center justify-center ${
                            active
                              ? 'border-[#172033] scale-110 shadow-sm'
                              : 'border-white/80 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.hex }}
                        >
                          {active && <span className="w-2 h-2 rounded-full bg-[#F7F3EA]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Required Teacher & Privacy Notice */}
          <div className="p-3.5 rounded-xl bg-[#236B67]/10 border border-[#236B67]/25 flex items-start gap-2.5 text-xs sm:text-sm text-[#172033]/90 leading-relaxed">
            <Sparkles className="w-4 h-4 text-[#236B67] shrink-0 mt-0.5" />
            <p>
              여기서 쓴 글은 선생님께 전달돼요. 친구들에게는 내가 &lsquo;공개해도 좋아요&rsquo;를 고른 글만 보여요.
            </p>
          </div>
        </div>

        {/* Start Action & Corner Teacher Button */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onOpenTeacher}
            className="px-3 py-2 rounded-lg text-xs font-semibold text-[#172033]/65 hover:text-[#172033] hover:bg-[#ECE4D3] transition-colors whitespace-nowrap cursor-pointer self-start sm:self-auto"
          >
            선생님
          </button>

          <button
            type="button"
            onClick={onStart}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#E8A33D] hover:bg-[#DC9630] text-[#172033] font-bold text-sm sm:text-base shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>바다로 출발하기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
