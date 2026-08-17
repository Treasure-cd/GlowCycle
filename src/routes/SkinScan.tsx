import { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  ArrowCounterClockwise, 
  Sparkle,
  Sun,
  UserFocus,
  CornersOut
} from "@phosphor-icons/react";
import { getUserProfile } from "../services/firestore";
import { auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import { runFullSkinAnalysisFlow, parseYouCamResults } from "../services/youcam";
import { saveScanResult } from "../services/firestore";
import { fetchLocalWeather } from "../services/weather";
import { getCycleDayAtDate, getCurrentPositionAsync } from "../utils";
import { getCyclePhase } from "../lib/skinRulesEngine";

const SkinScan = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showLibraryModal, setShowLibraryModal] = useState(false); // ADD THIS
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);
  const [isFirstScan, setIsFirstScan] = useState(true);
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [cycleDay, setCycleDay] = useState<number | null>(null);

  
  useEffect(() => {
    async function checkRecords() {
      if (!auth.currentUser) return;
      const profile = await getUserProfile(auth.currentUser.uid);
      if (profile) setCycleDay(getCycleDayAtDate(profile.lastPeriodStart, new Date()));
      setIsFirstScan(!profile?.hasScanned);
    }
    checkRecords();
  }, []);

  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    if (!auth.currentUser) {
      setAnalyzeError("You need to be signed in to save a scan.");
      return;
    }
    if (cycleDay === null) {
      setAnalyzeError("Still loading your cycle info — try again in a moment.");
      return;
    }

    setIsAnalyzing(true);
    setAnalyzeError(null);
    setStatusMessage(null);

    try {
      const position = await getCurrentPositionAsync();
      const { latitude, longitude } = position.coords;
      const currentWeather = await fetchLocalWeather(latitude, longitude);

      const rawResults = await runFullSkinAnalysisFlow(
        imageFile,
        ["acne", "oiliness", "moisture", "redness", "texture"],
        (message) => {
          console.log(message);
          setStatusMessage(message);
        }
      );

      if (!rawResults) throw new Error("Analysis flow returned null");

      const cleanScores = parseYouCamResults(rawResults);

      await saveScanResult(auth.currentUser.uid, cleanScores, currentWeather, cycleDay);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setAnalyzeError("Something went wrong analyzing your skin. Want to try again?");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetake = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setImageFile(null);
    setAnalyzeError(null);
  };

  const phase = cycleDay !== null ? getCyclePhase(cycleDay) : null;

  return (
    // 1. Increased max-width on desktop (md:max-w-4xl)
    <div className="mx-auto max-w-md px-6 py-10 md:max-w-4xl md:py-16">
      
      {/* 2. Grid layout: 1 column on mobile, 2 columns on desktop */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start md:gap-16">
        
        {/* LEFT COLUMN: Text & Instructions */}
        <div className="flex flex-col">
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
            {isFirstScan ? "Let's do your first skin scan" : "New scan"}
          </h2>
          <p className="mt-2 text-sm text-foreground/60 md:text-base">
            {cycleDay !== null && phase
              ? `Logged as Day ${cycleDay} · ${phase.charAt(0).toUpperCase() + phase.slice(1)}`
              : "Loading your cycle info…"}
          </p>

          {/* 
            Instructions: 
            Hidden on mobile IF a photo is taken to save space. 
            Always visible on desktop to balance the layout. 
          */}
          <div className={`mt-8 flex-col gap-4 rounded-2xl border border-border bg-surface p-5 text-sm text-foreground/80 shadow-sm ${imagePreview ? 'hidden md:flex' : 'flex'}`}>
            <p className="font-semibold text-foreground">For the most accurate scan:</p>
            <ul className="flex flex-col gap-3.5">
              <li className="flex items-start gap-3">
                <UserFocus className="mt-0.5 shrink-0 text-primary" size={20} weight="duotone" />
                <span><strong>Face directly</strong> at the camera.</span>
              </li>
              <li className="flex items-start gap-3">
                <Sun className="mt-0.5 shrink-0 text-primary" size={20} weight="duotone" />
                <span>Find <strong>bright, even lighting</strong> (avoid heavy shadows).</span>
              </li>
              <li className="flex items-start gap-3">
                <CornersOut className="mt-0.5 shrink-0 text-primary" size={20} weight="duotone" />
                <span><strong>Get close!</strong> Your face should make up a good portion of the picture.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: Actions / Camera / Preview */}
        <div className="flex w-full flex-col">
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={handlePhotoCapture}
          />
          <input
            ref={libraryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoCapture}
          />

          {!imagePreview ? (
            <>
              {/* Camera Capture Button */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="group relative flex aspect-square w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border-2 border-dashed border-border bg-surface text-foreground/50 transition-colors hover:border-primary/40 hover:text-foreground/70"
              >
                <Camera size={44} weight="duotone" className="z-10" />
                <span className="z-10 text-sm font-medium">Tap to take a photo</span>
              </button>

              {/* Library Button */}
          <button
              type="button"
              onClick={() => setShowLibraryModal(true)} // CHANGED THIS LINE
              className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-primary/5"
            >
              Choose from library
            </button>
            </>
          ) : (
            <>
              {/* Preview Square */}
              <div className="aspect-square w-full overflow-hidden rounded-3xl border border-border bg-surface">
                <img src={imagePreview} alt="Selfie preview" className="h-full w-full object-cover" />
              </div>

              {analyzeError && (
                <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{analyzeError}</p>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRetake}
                  disabled={isAnalyzing}
                  className="flex items-center gap-1.5 rounded-xl border border-transparent px-4 py-3.5 text-sm font-medium text-foreground/60 transition-colors hover:border-border hover:bg-surface hover:text-foreground disabled:opacity-40"
                >
                  <ArrowCounterClockwise size={16} weight="bold" />
                  Retake
                </button>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || cycleDay === null}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-medium text-background transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Sparkle size={16} weight="bold" />
                  {isAnalyzing ? "Analyzing…" : "Analyze Skin"}
                </button>
              </div>

              {isAnalyzing && statusMessage && (
                <p className="mt-3 text-center font-mono text-xs text-foreground/40">{statusMessage}</p>
              )}
            </>
          )}
        </div>
        
      </div>
    {/* Library Instructions Modal */}
      {showLibraryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 px-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <h3 className="font-display text-xl font-bold text-foreground">Choose from library</h3>
            <p className="mt-3 text-sm leading-relaxed text-foreground/80">
              Choose a picture that has been taken in recent history for very accurate results. Make sure your face is showing and that your face takes up a lot of the picture.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLibraryModal(false)}
                className="flex-1 rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-foreground/70 transition-colors hover:border-border hover:bg-background hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLibraryModal(false);
                  libraryInputRef.current?.click();
                }}
                className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-background transition-colors hover:bg-primary-hover"
              >
                Select Photo
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div> 
  );
};

export default SkinScan;