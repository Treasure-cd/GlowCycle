import { useState, useRef, useEffect } from "react";
import { getUserProfile } from "../lib/firestore";
import { auth } from "../lib/firebase"
import { useNavigate } from "react-router-dom";
import { requestUploadUrl, uploadImage, startSkinAnalysisTask, pollSkinAnalysisTask } from "../lib/youcam";
import { saveScanResult } from "../lib/firestore";

const SkinScan = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isFirstScan, setIsFirstScan] = useState(true);
    const navigate = useNavigate();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  useEffect(() => {
    async function checkFirstScan() {
      if (!auth.currentUser) return;
      const profile = await getUserProfile(auth.currentUser.uid);
      setIsFirstScan(!profile?.hasScanned);
    }
    checkFirstScan();
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
  if (!imageFile || !auth.currentUser) return;

  setIsAnalyzing(true);
  setAnalyzeError(null);

  try {
    const { fileId, uploadUrl, uploadHeaders } = await requestUploadUrl(imageFile);
    await uploadImage(uploadUrl, uploadHeaders, imageFile);
    const taskId = await startSkinAnalysisTask(fileId, ["wrinkle", "pore", "texture", "acne"]);
    const results = await pollSkinAnalysisTask(taskId);

    console.log("Skin analysis results:", results); // TEMP — inspect this shape, then type it properly

    await saveScanResult(auth.currentUser.uid, results);
    navigate("/dashboard");
  } catch (err) {
    console.error(err);
    setAnalyzeError("Something went wrong analyzing your skin. Want to try again?");
  } finally {
    setIsAnalyzing(false);
  }
};
  const handleRetake = () => {
    setImagePreview(null);
    setImageFile(null);
  };
  
  return (
    <div>
        <h2>Let's do your first skin scan!</h2>


    <button onClick={() => fileInputRef.current?.click()}>Take Photo</button>
    <button onClick={() => fileInputRef.current?.click()}>Choose Image (most recent for accurate results)</button>
    <input ref={fileInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handlePhotoCapture} />

  {imagePreview && <img src={imagePreview} alt="Selfie preview" className="w-full h-full object-cover" />}
            <button 
              onClick={handleRetake}
            >
              Retake
            </button>
            <button 
              onClick={handleAnalyze}
            >
              Analyze Skin
            </button>
    </div>
  )
}

export default SkinScan