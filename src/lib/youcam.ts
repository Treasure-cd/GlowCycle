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
    status: SkinAnalysisTaskStatus;
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

    const { status, results } = response.data;
    console.log("Status: ", status);
    console.log("Results: ", results)

    if (status === "success") {
      return results ?? [];
    }

    if (status === "error") {
      throw new Error(`Skin analysis task ${taskId} failed`);
    }

    // status === "running" — wait and check again
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error(`Skin analysis task ${taskId} timed out after ${MAX_POLL_ATTEMPTS} attempts`);
}