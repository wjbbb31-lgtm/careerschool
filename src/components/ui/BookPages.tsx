import {
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
import { HexagonChart } from './HexagonChart';

export interface BookDataSnapshot {
  profile: PlayerProfile;
  hollandScores: HollandScores;
  interestWriting: string;
  fourS: FourSData;
  lighthouseWriting: string;
  ch3State: Chapter3State;
  ch3Writing: string;
  ch4State: Chapter4State;
}

const FONT_SERIF = "'Gowun Batang', 'Noto Sans KR', serif";
const FONT_SANS = "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif";

export function BookCoverPage({
  data,
  width,
  height,
}: {
  data: BookDataSnapshot;
  width?: string | number;
  height?: string | number;
}) {
  const topCode = getTopHollandCode(data.hollandScores);

  return (
    <div
      style={{
        width: width ?? '100%',
        height: height ?? '100%',
        minHeight: 460,
        backgroundColor: '#236B67',
        color: '#F7F3EA',
        borderRadius: 14,
        border: '3px solid #E8A33D',
        padding: '28px 26px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: FONT_SANS,
        position: 'relative',
      }}
    >
      {/* Top Spine Line & Header */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12,
            color: '#ECE4D3',
            borderBottom: '1px solid rgba(247, 243, 234, 0.25)',
            paddingBottom: 10,
          }}
        >
          <span>5~6학년 전환기 진로 기록집</span>
          <span>나의 다음 페이지</span>
        </div>

        <div style={{ marginTop: 22, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#E8A33D', fontWeight: 700, letterSpacing: '0.04em' }}>
            NEXT PAGE EDITION
          </div>
          <h3
            style={{
              fontFamily: FONT_SERIF,
              fontSize: 24,
              fontWeight: 700,
              lineHeight: 1.35,
              margin: '10px 0 6px',
              color: '#F7F3EA',
              wordBreak: 'keep-all',
            }}
          >
            {data.ch4State.bookTitle || '나의 다음 페이지'}
          </h3>
          <p style={{ fontSize: 13, color: '#ECE4D3', margin: 0 }}>
            지은이 · {data.profile.nickname}
            {data.profile.classCode ? ` (${data.profile.classCode})` : ''}
          </p>
        </div>
      </div>

      {/* Center Paper Emblem with Hexagon Chart */}
      <div
        style={{
          margin: '18px auto',
          backgroundColor: '#F7F3EA',
          color: '#172033',
          borderRadius: 12,
          padding: '14px 18px',
          border: '1px solid #D8CCB8',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          width: '100%',
          maxWidth: 250,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: '#236B67' }}>
          나의 흥미 코드 · {topCode}
        </div>
        <HexagonChart scores={data.hollandScores} size={146} />
      </div>

      {/* Footer ribbon */}
      <div
        style={{
          borderTop: '1px solid rgba(247, 243, 234, 0.25)',
          paddingTop: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 11,
          color: '#ECE4D3',
        }}
      >
        <span>흥미 · 전환 · 우연 · 나의 페이지</span>
        <span style={{ color: '#E8A33D', fontWeight: 700 }}>
          {data.ch4State.allowPublicShare ? '친구들과 함께 보기' : '선생님과 나누기'}
        </span>
      </div>
    </div>
  );
}

export function BookPage1({
  data,
  width,
  height,
}: {
  data: BookDataSnapshot;
  width?: string | number;
  height?: string | number;
}) {
  const topCode = getTopHollandCode(data.hollandScores);

  return (
    <div
      style={{
        width: width ?? '100%',
        height: height ?? '100%',
        minHeight: 460,
        backgroundColor: '#F7F3EA',
        color: '#172033',
        borderRadius: 12,
        border: '1px solid #D8CCB8',
        padding: '26px 24px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: FONT_SANS,
      }}
    >
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #D8CCB8',
            paddingBottom: 8,
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: '#236B67' }}>1쪽 · 흥미의 장</span>
          <span style={{ fontSize: 11, color: '#5A6270' }}>흥미 코드 {topCode}</span>
        </div>

        <h4
          style={{
            fontFamily: FONT_SERIF,
            fontSize: 18,
            fontWeight: 700,
            color: '#172033',
            margin: '0 0 12px',
          }}
        >
          시간 가는 줄 모르고 빠져드는 나의 관심사
        </h4>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E3DAC8',
            borderRadius: 10,
            padding: 16,
            fontSize: 13.5,
            lineHeight: 1.7,
            color: '#172033',
            minHeight: 170,
            whiteSpace: 'pre-wrap',
            wordBreak: 'keep-all',
          }}
        >
          {data.interestWriting ||
            '아직 흥미의 장 기록이 비어 있어요. 아래 "글 고치기" 버튼을 눌러 언제든 채울 수 있어요.'}
        </div>
      </div>

      <div
        style={{
          marginTop: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ECE4D3',
          borderRadius: 10,
          padding: '10px 14px',
        }}
      >
        <div style={{ fontSize: 12, lineHeight: 1.5, color: '#172033' }}>
          <div style={{ fontWeight: 700, color: '#236B67' }}>나의 흥미 균형</div>
          <div>가장 두드러진 영역: {topCode}</div>
        </div>
        <HexagonChart scores={data.hollandScores} size={92} />
      </div>
    </div>
  );
}

export function BookPage2({
  data,
  width,
  height,
}: {
  data: BookDataSnapshot;
  width?: string | number;
  height?: string | number;
}) {
  const boxes = [
    { label: '상황 (Situation)', text: data.fourS.situation },
    { label: '나 (Self)', text: data.fourS.self },
    { label: '도움 (Support)', text: data.fourS.support },
    { label: '방법 (Strategy)', text: data.fourS.strategy },
  ];

  return (
    <div
      style={{
        width: width ?? '100%',
        height: height ?? '100%',
        minHeight: 460,
        backgroundColor: '#F7F3EA',
        color: '#172033',
        borderRadius: 12,
        border: '1px solid #D8CCB8',
        padding: '26px 24px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: FONT_SANS,
      }}
    >
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #D8CCB8',
            paddingBottom: 8,
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: '#236B67' }}>2쪽 · 전환의 장</span>
          <span style={{ fontSize: 11, color: '#5A6270' }}>4S 나침반</span>
        </div>

        <h4
          style={{
            fontFamily: FONT_SERIF,
            fontSize: 18,
            fontWeight: 700,
            color: '#172033',
            margin: '0 0 12px',
          }}
        >
          중학교라는 새 바다를 건너는 힘
        </h4>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
          }}
        >
          {boxes.map((b) => (
            <div
              key={b.label}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E3DAC8',
                borderRadius: 9,
                padding: 11,
                minHeight: 108,
                boxSizing: 'border-box',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: '#236B67', marginBottom: 5 }}>
                {b.label}
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.55, color: '#172033', wordBreak: 'keep-all' }}>
                {b.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {data.lighthouseWriting && (
        <div
          style={{
            marginTop: 14,
            backgroundColor: '#ECE4D3',
            borderRadius: 9,
            padding: '10px 12px',
            fontSize: 12,
            lineHeight: 1.55,
            color: '#172033',
          }}
        >
          <strong style={{ color: '#236B67' }}>등대의 메모 · </strong>
          {data.lighthouseWriting}
        </div>
      )}
    </div>
  );
}

export function BookPage3({
  data,
  width,
  height,
}: {
  data: BookDataSnapshot;
  width?: string | number;
  height?: string | number;
}) {
  const card = SERENDIPITY_CARDS.find((c) => c.id === data.ch3State.cardId);
  const attitude = SERENDIPITY_ATTITUDES.find((a) => a.id === data.ch3State.attitudeId);

  return (
    <div
      style={{
        width: width ?? '100%',
        height: height ?? '100%',
        minHeight: 460,
        backgroundColor: '#F7F3EA',
        color: '#172033',
        borderRadius: 12,
        border: '1px solid #D8CCB8',
        padding: '26px 24px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: FONT_SANS,
      }}
    >
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #D8CCB8',
            paddingBottom: 8,
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: '#236B67' }}>3쪽 · 우연의 장</span>
          <span style={{ fontSize: 11, color: '#5A6270' }}>계획된 우연</span>
        </div>

        <h4
          style={{
            fontFamily: FONT_SERIF,
            fontSize: 18,
            fontWeight: 700,
            color: '#172033',
            margin: '0 0 12px',
          }}
        >
          뜻밖의 일을 기회로 바꾼 생각
        </h4>

        <div
          style={{
            backgroundColor: '#ECE4D3',
            borderRadius: 10,
            padding: 12,
            marginBottom: 10,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9D6617', marginBottom: 4 }}>
            뽑은 우연 카드
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#172033', lineHeight: 1.5 }}>
            {card ? `"${card.text}"` : '아직 유리병을 열지 않았어요.'}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E3DAC8',
            borderRadius: 10,
            padding: 12,
            marginBottom: 10,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#236B67', marginBottom: 4 }}>
            선택한 태도 · {attitude?.name ?? '미선택'}
          </div>
          <div style={{ fontSize: 12, color: '#4A5568', lineHeight: 1.5 }}>
            {attitude?.description ?? '다섯 가지 태도 중 하나를 골라 보세요.'}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E3DAC8',
            borderRadius: 10,
            padding: 14,
            fontSize: 13.5,
            lineHeight: 1.65,
            color: '#172033',
            minHeight: 110,
            whiteSpace: 'pre-wrap',
          }}
        >
          {data.ch3Writing || '우연의 바다에서 적은 이야기가 이곳에 담겨요.'}
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#5A6270', textAlign: 'right', marginTop: 10 }}>
        크럼볼츠 계획된 우연 이론
      </div>
    </div>
  );
}

export function BookPage4({
  data,
  width,
  height,
}: {
  data: BookDataSnapshot;
  width?: string | number;
  height?: string | number;
}) {
  return (
    <div
      style={{
        width: width ?? '100%',
        height: height ?? '100%',
        minHeight: 460,
        backgroundColor: '#F7F3EA',
        color: '#172033',
        borderRadius: 12,
        border: '1px solid #D8CCB8',
        padding: '26px 24px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: FONT_SANS,
      }}
    >
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #D8CCB8',
            paddingBottom: 8,
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: '#236B67' }}>4쪽 · 다음 페이지</span>
          <span style={{ fontSize: 11, color: '#5A6270' }}>나의 새로운 시작</span>
        </div>

        <div
          style={{
            backgroundColor: '#172033',
            color: '#F7F3EA',
            borderRadius: 10,
            padding: 14,
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 11, color: '#E8A33D', fontWeight: 700, marginBottom: 5 }}>
            나의 책 첫 문장
          </div>
          <div
            style={{
              fontFamily: FONT_SERIF,
              fontSize: 15,
              lineHeight: 1.6,
              color: '#F7F3EA',
              wordBreak: 'keep-all',
            }}
          >
            &ldquo;{data.ch4State.firstSentence || '중학교 첫날, 나의 새로운 이야기가 시작된다.'}&rdquo;
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E3DAC8',
            borderRadius: 10,
            padding: 15,
            minHeight: 185,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#236B67', marginBottom: 6 }}>
            중학생이 된 나에게 보내는 편지
          </div>
          <div
            style={{
              fontSize: 13,
              lineHeight: 1.7,
              color: '#172033',
              whiteSpace: 'pre-wrap',
              wordBreak: 'keep-all',
            }}
          >
            {data.ch4State.letter
              ? data.ch4State.letter
              : '편지는 나중에 마음을 담아 적기로 했어요. "글 고치기"에서 언제든 추가할 수 있어요.'}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          paddingTop: 10,
          borderTop: '1px solid #D8CCB8',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          color: '#5A6270',
        }}
      >
        <span>작성자 · {data.profile.nickname}</span>
        <span>{data.ch4State.allowPublicShare ? '친구들과 공개' : '선생님만 보기'}</span>
      </div>
    </div>
  );
}
