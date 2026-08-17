import { useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { 
  Camera, 
  CheckCircle, 
  XCircle, 
  MinusCircle, 
  UserFocus, 
  Sun, 
  CornersOut,
  ArrowRight
} from "@phosphor-icons/react";
import { runFullSkinAnalysisFlow, parseYouCamResults } from "../services/youcam";
import { fetchLocalWeather } from "../services/weather";
import { getCycleDayAtDate, getCurrentPositionAsync } from "../utils";
import { interpretScan } from "../lib/skinRulesEngine";
import { generateProductRecommendations } from "../lib/productRules";
import { evaluateProductFit } from "../utils/RetailFit";
import type { ProductFitResult } from "../utils/RetailFit";
import { DEMO_PRODUCTS, getDemoProduct } from "../utils/DemoProduct";

function todayDateString(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const VERDICT_COPY: Record<ProductFitResult["verdict"], { label: string; icon: typeof CheckCircle }> = {
  good: { label: "Good fit right now", icon: CheckCircle },
  skip: { label: "Skip this one for now", icon: XCircle },
  neutral: { label: "No strong signal either way", icon: MinusCircle },
};

export default function ProductCheck() {
  const [searchParams] = useSearchParams();
  const product = getDemoProduct(searchParams.get("product"));

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  
  const [birthYear, setBirthYear] = useState("");
  const [lastPeriodStart, setLastPeriodStart] = useState("");

  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProductFitResult | null>(null);

  const canSubmit = imageFile !== null && birthYear.length === 4 && lastPeriodStart.length > 0;

  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  async function handleCheck() {
    if (!product || !imageFile || !canSubmit) return;

    setIsChecking(true);
    setError(null);
    setStatusMessage(null);
    setResult(null);

    try {
      const position = await getCurrentPositionAsync();
      const { latitude, longitude } = position.coords;
      const weather = await fetchLocalWeather(latitude, longitude);

      const rawResults = await runFullSkinAnalysisFlow(
        imageFile,
        ["acne", "oiliness", "moisture", "redness", "texture"],
        (message) => {
          console.log(message);
          setStatusMessage(message);
        }
      );
      if (!rawResults) throw new Error("Analysis flow returned null");

      const scores = parseYouCamResults(rawResults);
      const cycleDay = getCycleDayAtDate(lastPeriodStart, new Date());
      const interpretation = interpretScan(scores, {
        birthYear: Number(birthYear),
        cycleDay,
        weather,
      });
      const recommendation = generateProductRecommendations(interpretation);
      const fit = evaluateProductFit(product, recommendation);

      setResult(fit);
    } catch (err) {
      console.error(err);
      setError("Something went wrong checking this product. Want to try again?");
    } finally {
      setIsChecking(false);
    }
  }

  // DEMO PICKER
  if (!product) {
    return (
      <div className="mx-auto max-w-md px-6 py-10 md:max-w-4xl md:py-16">
        <p className="font-display text-2xl font-bold text-foreground">Check a product</p>
        <p className="mt-1 text-sm text-foreground/60">
          This page is meant to be linked from a retailer's product page. Pick a demo product to try the flow:
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {DEMO_PRODUCTS.map((p) => (
            <Link
              key={p.id}
              to={`/check?product=${p.id}`}
              className="rounded-xl border border-border bg-surface px-5 py-4 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <span className="block font-bold">{p.name}</span>
              {p.brand && <span className="mt-1 block text-foreground/50">{p.brand}</span>}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-10 md:max-w-5xl md:py-16">
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start md:gap-16">
        
        {/* LEFT COLUMN: Product Info & Instructions */}
        <div className="flex flex-col">
          <p className="font-mono text-xs uppercase tracking-wide text-foreground/50">Checking</p>
          <p className="mt-1 font-display text-2xl font-bold text-foreground md:text-3xl">{product.name}</p>
          {product.brand && <p className="text-sm text-foreground/60 md:text-base">{product.brand}</p>}

          {/* Instructions Block (hides on mobile if photo taken, stays on desktop) */}
          {!result && (
            <div className={`mt-8 flex-col gap-4 rounded-2xl border border-border bg-surface p-5 text-sm text-foreground/80 shadow-sm ${imagePreview ? 'hidden md:flex' : 'flex'}`}>
              <p className="font-semibold text-foreground">For the most accurate scan:</p>
              <ul className="flex flex-col gap-3.5">
                <li className="flex items-start gap-3">
                  <UserFocus className="mt-0.5 shrink-0 text-primary" size={20} weight="duotone" />
                  <span><strong>Face directly</strong> at the camera without glasses.</span>
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
          )}
        </div>

        {/* RIGHT COLUMN: Camera & Form OR Verdict */}
        <div className="flex w-full flex-col">
          {result ? (
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm md:p-8 animate-in slide-in-from-bottom-4 fade-in duration-300">
              <VerdictBlock result={result} />
              
              {/* THE BRIDGE: Converting fleeting users to lasting users */}
              <div className="mt-8 border-t border-border pt-6 text-center">
                <p className="text-sm text-foreground/60">Want to track your skin's changes throughout your cycle?</p>
                <Link to="/auth?mode=signup" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90">
                  Create a free account <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm md:p-8">
              <p className="text-sm text-foreground/60">
                A quick scan and two dates tells us whether this fits your skin today.
              </p>

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
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="group relative mt-5 flex aspect-square w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed border-border bg-background text-foreground/50 transition-colors hover:border-primary/40 hover:text-foreground/70"
                  >
                    <Camera size={36} weight="duotone" className="z-10" />
                    <span className="z-10 text-sm font-medium">Tap to take a photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLibraryModal(true)}
                    className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-transparent py-3 text-sm font-medium text-foreground transition-colors hover:border-border hover:bg-background"
                  >
                    Choose from library
                  </button>
                </>
              ) : (
                <div className="mt-5 aspect-square w-full overflow-hidden rounded-2xl border border-border bg-background">
                  <img src={imagePreview} alt="Selfie preview" className="h-full w-full object-cover" />
                </div>
              )}

              <div className="mt-4 flex gap-3">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Birth year"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value.slice(0, 4))}
                  className="w-1/2 rounded-xl border border-border bg-background px-4 py-3.5 text-base text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  type="date"
                  value={lastPeriodStart}
                  max={todayDateString()}
                  onChange={(e) => setLastPeriodStart(e.target.value)}
                  className="w-1/2 rounded-xl border border-border bg-background px-4 py-3.5 text-base text-foreground [color-scheme:light] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:[color-scheme:dark]"
                />
              </div>

              {error && (
                <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
              )}

              <button
                onClick={handleCheck}
                disabled={!canSubmit || isChecking}
                className="mt-5 w-full rounded-xl bg-primary py-3.5 font-medium text-background transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isChecking ? "Checking…" : "Check this product"}
              </button>

              {isChecking && statusMessage && (
                <p className="mt-3 text-center font-mono text-xs text-foreground/40">{statusMessage}</p>
              )}
            </div>
          )}
          
          <p className="mt-4 text-center text-xs text-foreground/40">
            Nothing you enter here is saved. General skincare guidance, not medical advice.
          </p>
        </div>
      </div>

      {/* Library Instructions Modal */}
      {showLibraryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 px-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <h3 className="font-display text-xl font-bold text-foreground">Choose from library</h3>
            <p className="mt-3 text-sm leading-relaxed text-foreground/80">
              Choose a picture that has been taken recently for accurate results. Make sure your face is showing clearly and takes up a large portion of the picture.
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
}

function VerdictBlock({ result }: { result: ProductFitResult }) {
  const { label, icon: Icon } = VERDICT_COPY[result.verdict];
  const isSkip = result.verdict === "skip";
  const isGood = result.verdict === "good";

  return (
    <div>
      <div
        className={`flex items-center gap-3 rounded-xl px-4 py-3.5 ${
          isSkip ? "bg-danger/10" : isGood ? "bg-primary text-background" : "border border-border"
        }`}
      >
        <Icon size={22} weight="bold" className={isSkip ? "text-danger" : ""} />
        <span className={`font-medium ${isSkip ? "text-danger" : ""}`}>{label}</span>
      </div>

      {result.matchedAvoid.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-wide text-foreground/60">Contains</p>
          <p className="mt-1 text-sm text-foreground/80">
            <span className="font-semibold">{result.matchedAvoid.join(", ")}</span> — you're currently avoiding this.
          </p>
        </div>
      )}

      {result.matchedCore.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-wide text-foreground/60">Contains</p>
          <p className="mt-1 text-sm text-foreground/80">
            <span className="font-semibold">{result.matchedCore.join(", ")}</span> — a good match for your skin right now.
          </p>
        </div>
      )}
    </div>
  );
}