import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Ambil data file dari request frontend
    const formData = await req.formData();
    const image = formData.get("image_file") as File;

    if (!image) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // 2. Cek apakah API Key ada
    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server configuration error: API Key missing" },
        { status: 500 }
      );
    }

    // 3. Siapkan data untuk dikirim ke Provider (misal: remove.bg)
    const externalFormData = new FormData();
    externalFormData.append("image_file", image);
    externalFormData.append("size", "auto"); // Opsi tambahan

    // 4. Kirim ke External API (Server to Server)
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: externalFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("External API Error:", errorData);
      return NextResponse.json(
        { error: "Failed to process image with provider" },
        { status: response.status }
      );
    }

    // 5. Terima gambar hasil (binary) dan kirim balik ke frontend
    const imageBlob = await response.blob();
    const imageBuffer = await imageBlob.arrayBuffer();

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'attachment; filename="removed-bg.png"',
      },
    });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}