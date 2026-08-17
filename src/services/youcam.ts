const YOUCAM_API_KEY = import.meta.env.VITE_YOUCAM_API_KEY as string;
const YOUCAM_BASE_URL = "https://yce-api-01.makeupar.com";

async function youcamFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${YOUCAM_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${YOUCAM_API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`YouCam API error (${response.status}): ${errorBody}`);
  }

  return response.json() as Promise<T>;
}


interface FileUploadResponse {
  status: number;
  data: {
    files: {
      content_type: string;
      file_name: string;
      file_id: string;
      requests: {
        method: string;
        url: string;
        headers: Record<string, string>;
      }[];
    }[];
  };
}

export async function requestUploadUrl(file: File): Promise<{
  fileId: string;
  uploadUrl: string;
  uploadHeaders: Record<string, string>;
}> {
  const response = await youcamFetch<FileUploadResponse>("/s2s/v2.0/file", {
    method: "POST",
    body: JSON.stringify({
      files: [
        {
          content_type: file.type,
          file_name: file.name,
          file_size: file.size,
        },
      ],
    }),
  });

  const fileEntry = response.data.files[0];
  const uploadRequest = fileEntry.requests[0];

  return {
    fileId: fileEntry.file_id,
    uploadUrl: uploadRequest.url,
    uploadHeaders: uploadRequest.headers,
  };
}

export async function uploadImage(
  uploadUrl: string,
  uploadHeaders: Record<string, string>,
  file: File
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: uploadHeaders,
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Image upload failed (${response.status})`);
  }
}

interface SkinAnalysisTaskResponse {
  status: number;
  data: {
    task_id: string;
  };
}

export async function startSkinAnalysisTask(
  fileId: string,
  actions: string[],
  miniserverArgs: Record<string, unknown> = {}
): Promise<string> {
  const response = await youcamFetch<SkinAnalysisTaskResponse>("/s2s/v2.0/task/skin-analysis", {
    method: "POST",
    body: JSON.stringify({
      src_file_id: fileId,
      dst_actions: actions,
      miniserver_args: miniserverArgs,
      format: "json",
    }),
  });

  return response.data.task_id;
}

export type SkinAnalysisTaskStatus = "running" | "success" | "error";

interface SkinAnalysisResultItem {
  action: string;
  url: string;
  dst_id: string;
  // exact per-action fields (scores etc.) TBD — see note below
}

interface SkinAnalysisPollResponse {
  status: number;
  data: {
    task_id: string;
    task_status: SkinAnalysisTaskStatus;
    results?: SkinAnalysisResultItem[];
  };
}

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 40; // ~2 min ceiling for the demo, not the 24h window they mention

export async function pollSkinAnalysisTask(
  taskId: string
): Promise<SkinAnalysisResultItem[]> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const response = await youcamFetch<SkinAnalysisPollResponse>(
      `/s2s/v2.0/task/skin-analysis/${taskId}`,
      { method: "GET" }
    );

    // CHANGE 'status' to 'task_status' here
    const { task_status, results } = response.data; 
    console.log("Status: ", task_status);
    console.log("Results: ", results);

    // CHANGE 'status' to 'task_status' in these checks
    if (task_status === "success") {
      return results ?? [];
    }

if (task_status === "error") {
      // Let's dump the exact error payload from YouCam to the console
      console.error("YOUCAM ENGINE ERROR PAYLOAD:", response.data);
      
      const errorMessage = (response.data as any).error_message || (response.data as any).error || "Check console for details";
      throw new Error(`Skin analysis task failed: ${errorMessage}`);
    }

    // status === "running" — wait and check again
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error(`Skin analysis task ${taskId} timed out after ${MAX_POLL_ATTEMPTS} attempts`);
}
export async function runFullSkinAnalysisFlow(
  file: File, 
  actions: string[],
  onLog: (message: string, data?: any) => void
): Promise<SkinAnalysisResultItem[] | null> {
  try {
    onLog("Step 1: Requesting upload URL for file...", { name: file.name, size: file.size });
    const { fileId, uploadUrl, uploadHeaders } = await requestUploadUrl(file);
    onLog("Step 1 Complete. Got File ID:", { fileId, uploadUrl });

    onLog("Step 2: Uploading image binary to YouCam...");
    await uploadImage(uploadUrl, uploadHeaders, file);
    onLog("Step 2 Complete. Image successfully uploaded.");

    
    onLog("Step 3: Starting analysis task...", { fileId, actions });
    const taskId = await startSkinAnalysisTask(fileId, actions);
    onLog("Step 3 Complete. Task started with ID:", taskId);

    onLog("Step 4: Polling for results (this may take a few seconds)...");
    const results = await pollSkinAnalysisTask(taskId);
    onLog("Step 4 Complete. Final Results received!", results);

    return results;
  } catch (error) {
    onLog("ERROR in Analysis Flow:", error);
    console.error(error);
    return null;
  }
}

export interface SkinScores {
  acne: number;
  oiliness: number;
  moisture: number;
  redness: number;
  texture: number;
  overall: number;
  skinAge: number;
}

export function parseYouCamResults(rawPayload: any): SkinScores {
  const scores: SkinScores = {
    acne: 100,
    oiliness: 100,
    moisture: 100,
    redness: 100,
    texture: 100,
    overall: 100,
    skinAge: 0,
  };
  const resultsArray = Array.isArray(rawPayload) 
    ? rawPayload 
    : rawPayload?.output;

  if (!Array.isArray(resultsArray)) {
    console.warn("parseYouCamResults received invalid data shape:", rawPayload);
    return scores;
  }

  resultsArray.forEach((item) => {
    if (!item || !item.type) return;

    switch (item.type) {
      case "acne":
        scores.acne = item.ui_score ?? scores.acne;
        break;
      case "oiliness":
        scores.oiliness = item.ui_score ?? scores.oiliness;
        break;
      case "moisture":
        scores.moisture = item.ui_score ?? scores.moisture;
        break;
      case "redness":
        scores.redness = item.ui_score ?? scores.redness;
        break;
      case "texture":
        scores.texture = item.ui_score ?? scores.texture;
        break;
      case "all":
        scores.overall = item.score ?? scores.overall;
        break;
      case "skin_age":
        scores.skinAge = item.score ?? scores.skinAge;
        break;
    }
  });

  return scores;
}