// pages/api/uploadContext.js
export const config = {
  api: {
    bodyParser: false,
  },
  runtime: "nodejs",
};

import { formidable } from "formidable";
import fs from "fs/promises";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // parse formdata
    const form = formidable({});
    const [fields, files] = await form.parse(req);

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // læs fil
    const fileBuffer = await fs.readFile(file.filepath);

    // lav FormData til FastAPI
    const formData = new FormData();
    formData.append("file", new Blob([fileBuffer]), file.originalFilename);

    // send videre til FastAPI
    const backendUrl = process.env.PY_API_URL || "http://localhost:8000";

    const backendRes = await fetch(`${backendUrl}/uploadContext`, {
    method: "POST",
    body: formData,
    });

    // hent svar
    const data = await backendRes.json();

    // returnér til frontend
    return res.status(backendRes.status).json(data);

  } catch (err) {
    console.error("UploadContext error:", err);
    return res.status(500).json({ error: "Upload failed", detail: String(err) });
  }
}
