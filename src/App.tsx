import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { WorldCanvas } from './components/three/WorldCanvas';
import { BookDataSnapshot } from './components/ui/BookPages';
import { Chapter3Modal } from './components/ui/Chapter3Modal';
import { Chapter4Modal } from './components/ui/Chapter4Modal';
import { EditableChapterId, FinalBookModal } from './components/ui/FinalBookModal';
import { GameHud } from './components/ui/GameHud';
import { InterestEditorModal } from './components/ui/InterestEditorModal';
import { StartScreen } from './components/ui/StartScreen';
import { TeacherDashboard } from './components/ui/TeacherDashboard';
import { TeacherLoginModal } from './components/ui/TeacherLoginModal';
import { Transition4SModal } from './components/ui/Transition4SModal';
import { WebGLFallback } from './components/ui/WebGLFallback';
import { WritingBox } from './components/ui/WritingBox';
import { DEFAULT_FOUR_S, DEFAULT_HOLLAND_SCORES } from './data/chapters';
import { getIslandById, OUTFIT_COLOR_OPTIONS } from './data/islands';
import { generateNickname } from './data/nicknames';
import {
  Chapter3State,
  Chapter4State,
  FourSData,
  HollandScores,
  IslandId,
  PlayerProfile,
} from './types/game';
import {
  buildSheetRowPayload,
  computeSubmissionDigest,
  postBookToSheetDB,
} from './utils/sheetClient';
import {
  loadChapter3State,
  loadChapter4State,
  loadFourSData,
  loadHollandScores,
  loadLowSpecPreference,
  loadSavedProfile,
  loadSheetSubmittedDigest,
  loadWritingDraft,
  saveChapter3State,
  saveChapter4State,
  saveFourSData,
  saveHollandScores,
  saveLowSpecPreference,
  saveProfile,
  saveSheetSubmittedDigest,
} from './utils/storage';
import { detectWebGLCapabilities } from './utils/webgl';

type ActiveModal =
  | null
  | 'ch1'
  | 'ch2'
  | 'ch3'
  | 'ch4'
  | 'finalBook'
  | 'fallbackWriting';

function getInitialClassCode(): string {
  if (typeof window === 'undefined') return '';
  const param = new URLSearchParams(window.location.search).get('class');
  if (param && param.trim()) {
    return param.trim().toUpperCase();
  }
  return loadSavedProfile()?.classCode ?? '';
}

function getInitialProfile(): PlayerProfile {
  const saved = loadSavedProfile();
  return {
    classCode: getInitialClassCode(),
    nickname: saved?.nickname || generateNickname(),
    hairStyle: saved?.hairStyle || 'bob',
    outfitColor: saved?.outfitColor || OUTFIT_COLOR_OPTIONS[0].hex,
  };
}

export default function App() {
  const webglCaps = useMemo(() => detectWebGLCapabilities(), []);

  const [profile, setProfile] = useState<PlayerProfile>(getInitialProfile);
  const [lowSpec, setLowSpec] = useState<boolean>(() => loadLowSpecPreference() ?? false);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [currentIslandId, setCurrentIslandId] = useState<IslandId>('interest');
  const [sailingTargetId, setSailingTargetId] = useState<IslandId | null>(null);
  const [contextLost, setContextLost] = useState(false);

  // Career Chapters State
  const [hollandScores, setHollandScores] = useState<HollandScores>(
    () => loadHollandScores() ?? DEFAULT_HOLLAND_SCORES,
  );
  const [fourS, setFourS] = useState<FourSData>(() => loadFourSData() ?? DEFAULT_FOUR_S);
  const [ch3State, setCh3State] = useState<Chapter3State>(
    () =>
      loadChapter3State() ?? {
        cardId: '',
        attitudeId: null,
        completed: false,
      },
  );
  const [ch4State, setCh4State] = useState<Chapter4State>(
    () =>
      loadChapter4State() ?? {
        bookTitle: '',
        firstSentence: '',
        letter: '',
        letterSkipped: false,
        allowPublicShare: true,
        completed: false,
      },
  );

  // Active modal / 3D animation flags
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [ch4InitialStep, setCh4InitialStep] = useState<
    'review' | 'title' | 'sentence' | 'letter' | 'share'
  >('review');
  const [returnToBookAfterEdit, setReturnToBookAfterEdit] = useState(false);
  const [nearLibraryBook, setNearLibraryBook] = useState(false);
  const [finaleAnimating, setFinaleAnimating] = useState(false);
  const [dataRevision, setDataRevision] = useState(0);

  // Teacher & SheetDB states
  const [teacherLoginOpen, setTeacherLoginOpen] = useState(false);
  const [teacherClassCode, setTeacherClassCode] = useState<string | null>(null);
  const [sheetSaveFailed, setSheetSaveFailed] = useState(false);
  const inFlightDigestRef = useRef<string | null>(null);

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  const handleUpdateProfile = useCallback((patch: Partial<PlayerProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleRerollNickname = useCallback(() => {
    setProfile((prev) => ({
      ...prev,
      nickname: generateNickname(prev.nickname),
    }));
  }, []);

  const handleToggleLowSpec = useCallback(() => {
    setLowSpec((prev) => {
      const next = !prev;
      saveLowSpecPreference(next);
      return next;
    });
  }, []);

  const handleSelectIsland = useCallback(
    (targetId: IslandId) => {
      if (sailingTargetId || activeModal || showStartScreen || finaleAnimating) return;
      if (targetId === currentIslandId) return;
      setSailingTargetId(targetId);
    },
    [activeModal, currentIslandId, finaleAnimating, sailingTargetId, showStartScreen],
  );

  const handleArriveIsland = useCallback((islandId: IslandId) => {
    setCurrentIslandId(islandId);
    setSailingTargetId(null);
  }, []);

  const openModalForIsland = useCallback(
    (islandId: IslandId) => {
      if (sailingTargetId || finaleAnimating) return;
      setReturnToBookAfterEdit(false);
      if (islandId === 'interest') setActiveModal('ch1');
      else if (islandId === 'lighthouse') setActiveModal('ch2');
      else if (islandId === 'serendipity') setActiveModal('ch3');
      else {
        setCh4InitialStep('review');
        setActiveModal('ch4');
      }
    },
    [finaleAnimating, sailingTargetId],
  );

  const handleUpdateHolland = useCallback((next: HollandScores) => {
    setHollandScores(next);
    saveHollandScores(next);
    setDataRevision((r) => r + 1);
  }, []);

  const handleUpdateFourS = useCallback((next: FourSData) => {
    setFourS(next);
    saveFourSData(next);
    setDataRevision((r) => r + 1);
  }, []);

  const handleUpdateCh3 = useCallback((next: Chapter3State) => {
    setCh3State(next);
    saveChapter3State(next);
    setDataRevision((r) => r + 1);
  }, []);

  const handleUpdateCh4 = useCallback((next: Chapter4State) => {
    setCh4State(next);
    saveChapter4State(next);
    setDataRevision((r) => r + 1);
  }, []);

  const closeModalOrReturnToBook = useCallback(() => {
    if (returnToBookAfterEdit) {
      setReturnToBookAfterEdit(false);
      setActiveModal('finalBook');
    } else {
      setActiveModal(null);
    }
  }, [returnToBookAfterEdit]);

  const handleEditChapterFromBook = useCallback((chapter: EditableChapterId) => {
    setReturnToBookAfterEdit(true);
    if (chapter === 'ch1') setActiveModal('ch1');
    else if (chapter === 'ch2') setActiveModal('ch2');
    else if (chapter === 'ch3') setActiveModal('ch3');
    else {
      setCh4InitialStep('title');
      setActiveModal('ch4');
    }
  }, []);

  const handleTriggerFinale = useCallback(() => {
    setActiveModal(null);
    setReturnToBookAfterEdit(false);
    if (!webglCaps.supported || contextLost) {
      setActiveModal('finalBook');
      return;
    }
    setFinaleAnimating(true);
  }, [contextLost, webglCaps.supported]);

  const handleFinaleAnimationComplete = useCallback(() => {
    setFinaleAnimating(false);
    setActiveModal('finalBook');
  }, []);

  const bookData: BookDataSnapshot = useMemo(() => {
    void dataRevision;
    return {
      profile,
      hollandScores,
      interestWriting: loadWritingDraft('interest-reflection')?.content?.trim() ?? '',
      fourS,
      lighthouseWriting: loadWritingDraft('lighthouse-reflection')?.content?.trim() ?? '',
      ch3State,
      ch3Writing: loadWritingDraft('ch3-serendipity')?.content?.trim() ?? '',
      ch4State,
    };
  }, [ch3State, ch4State, dataRevision, fourS, hollandScores, profile]);

  // Sync completed book to SheetDB once upon arriving at Finale (or re-save after '글 고치기')
  useEffect(() => {
    if (teacherClassCode !== null) return;
    if (activeModal !== 'finalBook' || !ch4State.completed) return;

    const payload = buildSheetRowPayload(bookData);
    const { created_at: _createdAt, ...digestTarget } = payload;
    const digest = computeSubmissionDigest(digestTarget);

    if (loadSheetSubmittedDigest() === digest) {
      setSheetSaveFailed(false);
      return;
    }

    if (inFlightDigestRef.current === digest) return;
    inFlightDigestRef.current = digest;

    let cancelled = false;
    void postBookToSheetDB(payload).then((result) => {
      if (inFlightDigestRef.current === digest) {
        inFlightDigestRef.current = null;
      }
      if (result.ok) {
        saveSheetSubmittedDigest(digest);
      }
      if (cancelled) return;
      setSheetSaveFailed(!result.ok);
    });

    return () => {
      cancelled = true;
    };
  }, [activeModal, bookData, ch4State.completed, teacherClassCode]);

  const isOverlayBlocking3D = activeModal !== null;

  return (
    <main className="relative w-full h-full overflow-hidden bg-[#172033]">
      {teacherClassCode !== null ? (
        <TeacherDashboard
          classCode={teacherClassCode}
          lowSpec={lowSpec}
          isTouchDevice={webglCaps.isTouchDevice}
          isSoftwareGl={webglCaps.isSoftwareGl}
          webglSupported={webglCaps.supported && !contextLost}
          onExit={() => setTeacherClassCode(null)}
        />
      ) : (
        <>
      {!webglCaps.supported ? (
        <WebGLFallback
          reason="unsupported"
          onOpenSampleWriting={() => setActiveModal('fallbackWriting')}
        />
      ) : contextLost ? (
        <WebGLFallback
          reason="context-lost"
          onOpenSampleWriting={() => setActiveModal('fallbackWriting')}
        />
      ) : (
        <WorldCanvas
          hairStyle={profile.hairStyle}
          outfitColor={profile.outfitColor}
          currentIslandId={currentIslandId}
          sailingTargetId={sailingTargetId}
          lowSpec={lowSpec}
          isTouchDevice={webglCaps.isTouchDevice}
          isSoftwareGl={webglCaps.isSoftwareGl}
          isWritingOpen={isOverlayBlocking3D}
          showStartScreen={showStartScreen}
          ch3Completed={ch3State.completed}
          finaleAnimating={finaleAnimating}
          onArriveIsland={handleArriveIsland}
          onSelectIsland={handleSelectIsland}
          onOpenWriting={openModalForIsland}
          onOpenChapter3Bottle={() => openModalForIsland('serendipity')}
          onOpenChapter4Book={() => {
            if (ch4State.completed && !returnToBookAfterEdit) {
              setActiveModal('finalBook');
            } else {
              openModalForIsland('library');
            }
          }}
          onNearLibraryBookChange={setNearLibraryBook}
          onFinaleAnimationComplete={handleFinaleAnimationComplete}
          onContextLost={() => setContextLost(true)}
        />
      )}

      {showStartScreen && webglCaps.supported && !contextLost && (
        <StartScreen
          profile={profile}
          lowSpec={lowSpec}
          onUpdateProfile={handleUpdateProfile}
          onRerollNickname={handleRerollNickname}
          onToggleLowSpec={handleToggleLowSpec}
          onStart={() => setShowStartScreen(false)}
          onOpenTeacher={() => setTeacherLoginOpen(true)}
        />
      )}

      {!showStartScreen && !isOverlayBlocking3D && webglCaps.supported && !contextLost && (
        <GameHud
          profile={profile}
          currentIslandId={currentIslandId}
          sailingTargetId={sailingTargetId}
          lowSpec={lowSpec}
          ch3Completed={ch3State.completed}
          ch4Completed={ch4State.completed}
          nearLibraryBook={nearLibraryBook}
          finaleAnimating={finaleAnimating}
          onSelectIsland={handleSelectIsland}
          onOpenIslandActivity={openModalForIsland}
          onOpenFinalBook={() => setActiveModal('finalBook')}
          onToggleLowSpec={handleToggleLowSpec}
          onReopenStart={() => setShowStartScreen(true)}
        />
      )}

      {/* Chapter 1 Modal (Interest + Hexagon) */}
      <InterestEditorModal
        isOpen={activeModal === 'ch1'}
        scores={hollandScores}
        onChangeScores={handleUpdateHolland}
        onWritingSubmitted={() => setDataRevision((r) => r + 1)}
        onClose={closeModalOrReturnToBook}
      />

      {/* Chapter 2 Modal (4S + Lighthouse Writing) */}
      <Transition4SModal
        isOpen={activeModal === 'ch2'}
        fourS={fourS}
        onChangeFourS={handleUpdateFourS}
        onWritingSubmitted={() => setDataRevision((r) => r + 1)}
        onClose={closeModalOrReturnToBook}
      />

      {/* Chapter 3 Modal (Serendipity Bottle, Card, Attitude, WritingBox 3) */}
      <Chapter3Modal
        isOpen={activeModal === 'ch3'}
        state={ch3State}
        onUpdateState={handleUpdateCh3}
        onComplete={() => {
          setDataRevision((r) => r + 1);
          closeModalOrReturnToBook();
        }}
        onClose={closeModalOrReturnToBook}
      />

      {/* Chapter 4 Modal (Review, Book Title, First Sentence, Letter, Share) */}
      <Chapter4Modal
        isOpen={activeModal === 'ch4'}
        initialStep={ch4InitialStep}
        profile={profile}
        hollandScores={hollandScores}
        fourS={fourS}
        ch3State={ch3State}
        ch4State={ch4State}
        onUpdateCh4={handleUpdateCh4}
        onComplete={() => {
          setDataRevision((r) => r + 1);
          if (returnToBookAfterEdit) {
            setReturnToBookAfterEdit(false);
            setActiveModal('finalBook');
          } else {
            handleTriggerFinale();
          }
        }}
        onClose={closeModalOrReturnToBook}
      />

      {/* Finale Book Spread Modal */}
      <FinalBookModal
        isOpen={activeModal === 'finalBook'}
        data={bookData}
        sheetSaveFailed={sheetSaveFailed}
        onEditChapter={handleEditChapterFromBook}
        onReplay3DBook={() => {
          if (currentIslandId !== 'library') {
            setCurrentIslandId('library');
          }
          handleTriggerFinale();
        }}
        onClose={() => setActiveModal(null)}
      />

      {/* Fallback WritingBox when WebGL is unavailable */}
      <WritingBox
        isOpen={activeModal === 'fallbackWriting'}
        prompt={getIslandById(currentIslandId).writingPrompt}
        onClose={() => setActiveModal(null)}
        onSubmitted={() => setDataRevision((r) => r + 1)}
      />
        </>
      )}

      <TeacherLoginModal
        isOpen={teacherLoginOpen}
        defaultClassCode={profile.classCode}
        onSuccess={(code) => {
          setTeacherLoginOpen(false);
          setTeacherClassCode(code);
        }}
        onClose={() => setTeacherLoginOpen(false)}
      />
    </main>
  );
}
