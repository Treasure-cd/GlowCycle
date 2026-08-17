const YOUCAM_BASE_URL = "https://yce-api-01.makeupar.com";

export default async function handler(req: any, res: any) {
  const path = req.query.path as string;
  
  const response = await fetch(`${YOUCAM_BASE_URL}${path}`, {
    method: req.method,
    headers: {
      Authorization: `Bearer ${process.env.YOUCAM_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
  });
  
  const data = await response.json();
  res.status(response.status).json(data);
}