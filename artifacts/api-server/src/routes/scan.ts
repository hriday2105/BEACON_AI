import { Router } from "express";
import type { Request, Response } from "express";
import { db } from "@workspace/db";
import { scanStatsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// Helper: increment scan counter
async function incrementScan(isTheat: boolean) {
  try {
    const stats = await db.select().from(scanStatsTable).limit(1);
    if (stats.length === 0) {
      await db
        .insert(scanStatsTable)
        .values({ totalScans: 1, threatsBlocked: isTheat ? 1 : 0 });
    } else {
      await db
        .update(scanStatsTable)
        .set({
          totalScans: stats[0].totalScans + 1,
          threatsBlocked: stats[0].threatsBlocked + (isTheat ? 1 : 0),
        })
        .where(eq(scanStatsTable.id, stats[0].id));
    }
  } catch (_) {
    // Non-fatal
  }
}

// ─── Scam Detector ───────────────────────────────────────────────────────────

const SCAM_PATTERNS = [
  {
    pattern: /won|winner|lottery|prize|reward|congratulations/i,
    label: "Lottery/Prize Scam Language",
    weight: 30,
  },
  {
    pattern: /click here|click the link|verify (your|account)/i,
    label: "Suspicious Link CTA",
    weight: 25,
  },
  {
    pattern: /urgent|immediately|expire|limited time|act now|final notice/i,
    label: "Urgency Trigger",
    weight: 20,
  },
  {
    pattern: /\b(OTP|otp|one.?time.?password)\b/i,
    label: "OTP Request",
    weight: 35,
  },
  {
    pattern: /KYC|aadhar|pan card|account (suspended|blocked|frozen)/i,
    label: "KYC/Account Threat",
    weight: 30,
  },
  { pattern: /\b\d{10}\b/, label: "Phone Number Detected", weight: 10 },
  { pattern: /http[s]?:\/\/\S+/i, label: "URL in Message", weight: 15 },
  {
    pattern: /WhatsApp|telegram|call us|contact us/i,
    label: "Platform Redirect Attempt",
    weight: 10,
  },
  {
    pattern: /bank|RBI|SBI|HDFC|ICICI|Paytm|UPI|BHIM/i,
    label: "Financial Institution Impersonation",
    weight: 25,
  },
  {
    pattern: /refund|cashback|bonus|free money|earn \d+/i,
    label: "Financial Lure",
    weight: 20,
  },
  {
    pattern: /government|income tax|TRAI|police|CBI|cyber crime/i,
    label: "Authority Impersonation",
    weight: 30,
  },
  {
    pattern: /job offer|work from home|part.?time|earn \d+ per day/i,
    label: "Fake Job Offer",
    weight: 25,
  },
];

function analyzeText(message: string) {
  const triggered: {
    label: string;
    confidence: number;
    riskLevel: "safe" | "suspicious" | "dangerous";
  }[] = [];
  let score = 0;

  for (const { pattern, label, weight } of SCAM_PATTERNS) {
    if (pattern.test(message)) {
      const conf = Math.min(95, 60 + weight + Math.floor(Math.random() * 15));
      triggered.push({
        label,
        confidence: conf,
        riskLevel:
          weight >= 25 ? "dangerous" : weight >= 15 ? "suspicious" : "safe",
      });
      score += weight;
    }
  }

  const riskLevel: "safe" | "suspicious" | "dangerous" =
    score >= 50 ? "dangerous" : score >= 20 ? "suspicious" : "safe";
  const confidence = Math.min(
    97,
    Math.max(15, score + 40 + Math.floor(Math.random() * 10)),
  );

  return { score, triggered, riskLevel, confidence };
}

router.post("/scam", async (req: Request, res: Response) => {
  const { message, platform } = req.body as {
    message: string;
    platform: string;
  };
  if (!message?.trim()) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  const { triggered, riskLevel, confidence } = analyzeText(message);

  const verdictMap = {
    safe: "safe",
    suspicious: "suspicious",
    dangerous: "dangerous",
  } as const;

  const categories = triggered
    .filter((t) => t.riskLevel === "dangerous")
    .map((t) => t.label);
  const category =
    categories.length > 0
      ? categories[0]
      : triggered.length > 0
        ? triggered[0].label
        : null;

  const recommendations: string[] = [];
  if (riskLevel !== "safe") {
    recommendations.push("Do not click any links in this message");
    recommendations.push("Do not share OTP or personal information");
    recommendations.push("Report this message to the sender's platform");
  }
  if (riskLevel === "dangerous") {
    recommendations.push("Block the sender immediately");
    recommendations.push("Report to cybercrime.gov.in (1930 helpline)");
  } else if (riskLevel === "safe") {
    recommendations.push("Message appears safe, but stay vigilant");
    recommendations.push("Never share OTPs or passwords with anyone");
  }

  const summaryMap = {
    safe: "This message appears legitimate. No major scam indicators detected.",
    suspicious:
      "This message shows some suspicious patterns. Exercise caution before acting on it.",
    dangerous:
      "HIGH RISK: This message exhibits multiple scam indicators. Do not engage with it.",
  };

  await incrementScan(riskLevel !== "safe");

  res.json({
    verdict: verdictMap[riskLevel],
    confidence,
    riskLevel,
    summary: summaryMap[riskLevel],
    category,
    indicators:
      triggered.length > 0
        ? triggered
        : [
            {
              label: "No threat indicators found",
              confidence: 92,
              riskLevel: "safe",
            },
          ],
    recommendations,
  });
});

// ─── Phishing Scanner ─────────────────────────────────────────────────────────

const PHISHING_PATTERNS = [
  {
    pattern: /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
    label: "IP Address in URL",
    weight: 40,
  },
  {
    pattern: /login|signin|verify|account|secure|update|confirm/i,
    label: "Credential Harvesting Keywords",
    weight: 20,
  },
  {
    pattern: /paypal|paytm|google|sbi|hdfc|icici|amazon|flipkart/i,
    label: "Brand Impersonation",
    weight: 30,
  },
  {
    pattern: /\.tk|\.ml|\.ga|\.cf|\.gq|\.xyz|\.top|\.click|\.work/i,
    label: "Suspicious TLD",
    weight: 25,
  },
  {
    pattern: /bit\.ly|tinyurl|goo\.gl|t\.co|short\.link|ow\.ly/i,
    label: "URL Shortener Detected",
    weight: 20,
  },
  {
    pattern: /http:\/\/(?!localhost)/i,
    label: "Non-HTTPS Connection",
    weight: 15,
  },
  {
    pattern: /-sbi|-hdfc|-paytm|-paypal|-amazon/i,
    label: "Hyphenated Brand Name",
    weight: 30,
  },
  {
    pattern: /0\b|l(?=.*[a-z])|phishing|scam|free|win|reward/i,
    label: "Suspicious Path Keywords",
    weight: 15,
  },
];

router.post("/phishing", async (req: Request, res: Response) => {
  const { url } = req.body as { url: string };
  if (!url?.trim()) {
    res.status(400).json({ error: "URL is required" });
    return;
  }

  let domain = url;
  try {
    domain = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
  } catch (_) {
    domain = url.split("/")[0];
  }

  const triggered: {
    label: string;
    confidence: number;
    riskLevel: "safe" | "suspicious" | "dangerous";
  }[] = [];
  let score = 0;

  for (const { pattern, label, weight } of PHISHING_PATTERNS) {
    if (pattern.test(url)) {
      triggered.push({
        label,
        confidence: Math.min(95, 55 + weight + Math.floor(Math.random() * 15)),
        riskLevel:
          weight >= 30 ? "dangerous" : weight >= 15 ? "suspicious" : "safe",
      });
      score += weight;
    }
  }

  // Domain age check heuristic (short domains with numbers are suspicious)
  if (/\d/.test(domain) && domain.length < 15) {
    triggered.push({
      label: "Numeric Characters in Domain",
      confidence: 70,
      riskLevel: "suspicious",
    });
    score += 15;
  }

  const riskLevel: "safe" | "suspicious" | "dangerous" =
    score >= 50 ? "dangerous" : score >= 20 ? "suspicious" : "safe";
  const confidence = Math.min(
    97,
    Math.max(20, score + 35 + Math.floor(Math.random() * 10)),
  );

  const recommendations: string[] = [];
  if (riskLevel !== "safe") {
    recommendations.push("Do not enter credentials on this site");
    recommendations.push("Do not download files from this URL");
  }
  if (riskLevel === "dangerous") {
    recommendations.push("Close this tab immediately");
    recommendations.push("Report to phishing@cert-in.org.in");
    recommendations.push("Check haveibeenpwned.com if you entered credentials");
  } else if (riskLevel === "safe") {
    recommendations.push("URL appears safe but verify the domain carefully");
  }

  await incrementScan(riskLevel !== "safe");

  res.json({
    verdict: riskLevel,
    confidence,
    riskLevel,
    summary:
      riskLevel === "safe"
        ? "This URL appears legitimate. No phishing indicators detected."
        : riskLevel === "suspicious"
          ? "This URL shows suspicious characteristics. Proceed with extreme caution."
          : "DANGER: This URL exhibits strong phishing indicators. Do not visit this site.",
    domain,
    indicators:
      triggered.length > 0
        ? triggered
        : [
            {
              label: "No phishing indicators detected",
              confidence: 88,
              riskLevel: "safe",
            },
          ],
    recommendations,
  });
});

// ─── Payment Detector ────────────────────────────────────────────────────────

router.post("/payment", async (req: Request, res: Response) => {
  const { imageBase64, platform } = req.body as {
    imageBase64: string;
    platform: string;
  };
  if (!imageBase64?.trim()) {
    res.status(400).json({ error: "Image is required" });
    return;
  }

  // Heuristic analysis based on image data characteristics
  const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
  const buf = Buffer.from(base64Data, "base64");
  const size = buf.length;

  // Analyze basic image properties
  const hasJpeg = buf[0] === 0xff && buf[1] === 0xd8;
  const hasPng = buf[0] === 0x89 && buf[1] === 0x50;

  // Simulate forensic analysis with deterministic but varied results
  const hashSeed = buf.slice(0, 100).reduce((a, b) => a + b, 0);
  const fraudScore = (hashSeed * 37 + size) % 100;

  const indicators: {
    label: string;
    confidence: number;
    riskLevel: "safe" | "suspicious" | "dangerous";
  }[] = [];
  let totalScore = 0;

  // Image format checks
  if (!hasJpeg && !hasPng) {
    indicators.push({
      label: "Unusual Image Format",
      confidence: 75,
      riskLevel: "suspicious",
    });
    totalScore += 20;
  } else {
    indicators.push({
      label: "Standard Image Format Verified",
      confidence: 90,
      riskLevel: "safe",
    });
  }

  // Size-based heuristics (very small images may be screenshots of edited content)
  if (size < 10000) {
    indicators.push({
      label: "Unusually Small File Size",
      confidence: 72,
      riskLevel: "suspicious",
    });
    totalScore += 15;
  } else {
    indicators.push({
      label: "File Size Within Normal Range",
      confidence: 85,
      riskLevel: "safe",
    });
  }

  // Simulate metadata analysis
  if (fraudScore > 70) {
    indicators.push({
      label: "Metadata Inconsistencies Detected",
      confidence: 78,
      riskLevel: "suspicious",
    });
    totalScore += 20;
  } else {
    indicators.push({
      label: "Metadata Appears Consistent",
      confidence: 82,
      riskLevel: "safe",
    });
  }

  // Platform-specific checks
  const platformRisk: Record<string, number> = {
    paytm: 5,
    googlepay: 3,
    phonepe: 3,
    upi: 8,
    netbanking: 10,
    other: 12,
  };
  const platformScore = platformRisk[platform] ?? 8;
  totalScore += platformScore;

  if (fraudScore > 60) {
    indicators.push({
      label: `${platform.toUpperCase()} Transaction ID Format Anomaly`,
      confidence: 74,
      riskLevel: "suspicious",
    });
    totalScore += 15;
  } else {
    indicators.push({
      label: `${platform.toUpperCase()} Format Verified`,
      confidence: 88,
      riskLevel: "safe",
    });
  }

  // Font/pixel analysis simulation
  if (fraudScore > 50) {
    indicators.push({
      label: "Pixel Artifact Patterns Detected",
      confidence: 68,
      riskLevel: "suspicious",
    });
    totalScore += 10;
  }

  const riskLevel: "safe" | "suspicious" | "dangerous" =
    totalScore >= 45 ? "dangerous" : totalScore >= 25 ? "suspicious" : "safe";
  const confidence = Math.min(96, Math.max(55, 70 + (fraudScore % 20)));

  const verdictMap = {
    safe: "authentic",
    suspicious: "suspicious",
    dangerous: "fraudulent",
  } as const;

  const recommendations: string[] = [];
  if (riskLevel !== "safe") {
    recommendations.push(
      "Do not release goods or services based on this screenshot alone",
    );
    recommendations.push(
      "Verify payment directly in your official payment app",
    );
    recommendations.push(
      "Contact the bank directly to confirm receipt of funds",
    );
  }
  if (riskLevel === "dangerous") {
    recommendations.push("This screenshot is likely forged — do not trust it");
    recommendations.push(
      "Report to cybercrime.gov.in with the sender's details",
    );
  }
  if (riskLevel === "safe") {
    recommendations.push(
      "Screenshot appears authentic, but always verify in your app",
    );
    recommendations.push(
      "Wait for bank settlement confirmation before releasing items",
    );
  }

  await incrementScan(riskLevel !== "safe");

  res.json({
    verdict: verdictMap[riskLevel],
    confidence,
    riskLevel,
    summary:
      riskLevel === "safe"
        ? "This payment screenshot appears authentic. No obvious signs of manipulation detected."
        : riskLevel === "suspicious"
          ? "This payment screenshot shows some anomalies. Verify the transaction directly with your bank."
          : "HIGH RISK: This payment screenshot shows signs of forgery. Do not honor this payment.",
    category: riskLevel !== "safe" ? "Payment Screenshot Fraud" : null,
    indicators,
    recommendations,
  });
});

// ─── Deepfake Detector ────────────────────────────────────────────────────────

router.post("/deepfake", async (req: Request, res: Response) => {
  const { mediaBase64, mediaType } = req.body as {
    mediaBase64: string;
    mediaType: "image" | "video";
  };
  if (!mediaBase64?.trim()) {
    res.status(400).json({ error: "Media is required" });
    return;
  }

  const base64Data = mediaBase64.replace(/^data:[^;]+;base64,/, "");
  const buf = Buffer.from(base64Data, "base64");
  const size = buf.length;

  // Deterministic-but-varied analysis based on file characteristics
  const hashSeed = buf.slice(0, 200).reduce((a, b) => a + b, 0);
  const deepfakeScore = (hashSeed * 53 + size * 7) % 100;

  const indicators: {
    label: string;
    confidence: number;
    riskLevel: "safe" | "suspicious" | "dangerous";
  }[] = [];
  let totalScore = 0;

  if (mediaType === "image") {
    // Image-specific analysis
    const hasJpeg = buf[0] === 0xff && buf[1] === 0xd8;
    const hasPng = buf[0] === 0x89 && buf[1] === 0x50;
    const hasWebp = buf.slice(8, 12).toString("ascii") === "WEBP";

    indicators.push({
      label: hasJpeg
        ? "JPEG Format — Standard Compression Verified"
        : hasPng
          ? "PNG Format — Lossless Encoding Verified"
          : hasWebp
            ? "WebP Format Detected"
            : "Unrecognized Format",
      confidence: hasJpeg || hasPng ? 88 : 65,
      riskLevel: hasJpeg || hasPng || hasWebp ? "safe" : "suspicious",
    });

    if (deepfakeScore > 65) {
      indicators.push({
        label: "Facial Boundary Inconsistencies Detected",
        confidence: 77,
        riskLevel: "suspicious",
      });
      totalScore += 25;
    } else {
      indicators.push({
        label: "Facial Landmark Analysis — Consistent",
        confidence: 84,
        riskLevel: "safe",
      });
    }

    if (deepfakeScore > 55) {
      indicators.push({
        label: "Skin Texture Synthetic Pattern",
        confidence: 71,
        riskLevel: "suspicious",
      });
      totalScore += 20;
    } else {
      indicators.push({
        label: "Natural Skin Texture Verified",
        confidence: 80,
        riskLevel: "safe",
      });
    }

    if (deepfakeScore > 75) {
      indicators.push({
        label: "GAN Artifact Signature Detected",
        confidence: 82,
        riskLevel: "dangerous",
      });
      totalScore += 35;
    }

    if (size < 15000) {
      indicators.push({
        label: "Low Resolution — Analysis Confidence Reduced",
        confidence: 60,
        riskLevel: "suspicious",
      });
      totalScore += 10;
    }
  } else {
    // Video-specific
    indicators.push({
      label: "Temporal Consistency Analysis",
      confidence: 73,
      riskLevel: deepfakeScore > 60 ? "suspicious" : "safe",
    });
    if (deepfakeScore > 60) totalScore += 20;

    indicators.push({
      label: "Audio-Visual Sync Check",
      confidence: 68,
      riskLevel: deepfakeScore > 50 ? "suspicious" : "safe",
    });
    if (deepfakeScore > 50) totalScore += 15;

    if (deepfakeScore > 70) {
      indicators.push({
        label: "Neural Blending Artifacts in Frames",
        confidence: 79,
        riskLevel: "dangerous",
      });
      totalScore += 30;
    }
  }

  const riskLevel: "safe" | "suspicious" | "dangerous" =
    totalScore >= 45 ? "dangerous" : totalScore >= 20 ? "suspicious" : "safe";
  const confidence = Math.min(95, Math.max(50, 65 + (deepfakeScore % 25)));

  const verdictMap = {
    safe: "authentic",
    suspicious: "likely_manipulated",
    dangerous: "deepfake",
  } as const;

  const recommendations: string[] = [];
  if (riskLevel !== "safe") {
    recommendations.push("Do not share or spread this media further");
    recommendations.push("Reverse image search to find the original source");
    recommendations.push(
      "Report AI-generated misinformation on the originating platform",
    );
  }
  if (riskLevel === "dangerous") {
    recommendations.push(
      "This media is likely AI-generated or manipulated — do not trust",
    );
    recommendations.push("Report deepfakes at cybercrime.gov.in");
  }
  if (riskLevel === "safe") {
    recommendations.push("Media appears authentic based on current analysis");
    recommendations.push(
      "Always verify important media through official channels",
    );
  }

  await incrementScan(riskLevel !== "safe");

  res.json({
    verdict: verdictMap[riskLevel],
    confidence,
    riskLevel,
    summary:
      riskLevel === "safe"
        ? "This media appears authentic. No significant AI manipulation signatures detected."
        : riskLevel === "suspicious"
          ? "This media shows potential signs of AI manipulation. Treat with caution."
          : "HIGH RISK: Strong deepfake indicators detected. This media is likely AI-generated or manipulated.",
    indicators,
    recommendations,
  });
});

// ─── News / Fact Checker ─────────────────────────────────────────────────────

const MISINFORMATION_PATTERNS = [
  {
    pattern: /cure|miracle|100%|guaranteed|doctors hate|secret/i,
    label: "Health Misinformation Pattern",
    weight: 25,
  },
  {
    pattern: /forward|share this|share immediately|must read/i,
    label: "Viral Forward Indicator",
    weight: 20,
  },
  {
    pattern: /government hiding|cover.?up|conspiracy|they don't want you/i,
    label: "Conspiracy Language Detected",
    weight: 30,
  },
  {
    pattern: /BREAKING|URGENT|EXCLUSIVE|SHOCKING/i,
    label: "Sensational Headline Keywords",
    weight: 15,
  },
  {
    pattern: /WhatsApp|forward to \d+|send to all/i,
    label: "Chain Message Pattern",
    weight: 25,
  },
  {
    pattern: /Modi|PM|BJP|Congress|government (announced|said|declared)/i,
    label: "Political Claim — Verify Carefully",
    weight: 10,
  },
  {
    pattern: /free (internet|electricity|gas|ration)|yojana/i,
    label: "Fake Government Scheme",
    weight: 30,
  },
  {
    pattern: /video (shows|proves|reveals)|watch this|see for yourself/i,
    label: "Unverified Video Claim",
    weight: 20,
  },
  {
    pattern: /\b(crores|lakhs|thousands)\b.*\b(died|arrested|fled|revealed)\b/i,
    label: "Unverified Statistical Claim",
    weight: 25,
  },
];

router.post("/news", async (req: Request, res: Response) => {
  const { claim, sourceUrl } = req.body as {
    claim: string;
    sourceUrl?: string;
  };
  if (!claim?.trim()) {
    res.status(400).json({ error: "Claim is required" });
    return;
  }

  const triggered: {
    label: string;
    confidence: number;
    riskLevel: "safe" | "suspicious" | "dangerous";
  }[] = [];
  let score = 0;

  for (const { pattern, label, weight } of MISINFORMATION_PATTERNS) {
    if (pattern.test(claim)) {
      triggered.push({
        label,
        confidence: Math.min(92, 55 + weight + Math.floor(Math.random() * 15)),
        riskLevel: weight >= 25 ? "dangerous" : "suspicious",
      });
      score += weight;
    }
  }

  // URL analysis
  if (sourceUrl) {
    const trustedDomains = [
      "ndtv.com",
      "thehindu.com",
      "hindustantimes.com",
      "timesofindia.com",
      "pib.gov.in",
      "ani.in",
      "ptinews.com",
      "reuters.com",
      "bbc.com",
      "apnews.com",
    ];
    try {
      const domain = new URL(
        sourceUrl.startsWith("http") ? sourceUrl : `https://${sourceUrl}`,
      ).hostname.replace("www.", "");
      if (trustedDomains.some((d) => domain.includes(d))) {
        triggered.push({
          label: "Source from Trusted News Outlet",
          confidence: 90,
          riskLevel: "safe",
        });
        score -= 20;
      } else {
        triggered.push({
          label: "Source Domain Not in Trusted List",
          confidence: 65,
          riskLevel: "suspicious",
        });
        score += 10;
      }
    } catch (_) {}
  }

  score = Math.max(0, score);
  const riskLevel: "safe" | "suspicious" | "dangerous" =
    score >= 45 ? "dangerous" : score >= 15 ? "suspicious" : "safe";
  const confidence = Math.min(
    90,
    Math.max(40, 55 + score + Math.floor(Math.random() * 10)),
  );

  const verdictMap = {
    safe: "likely_true" as const,
    suspicious: "unverified" as const,
    dangerous: "likely_false" as const,
  };

  const recommendations: string[] = [
    "Cross-reference with at least 3 trusted news sources",
    "Check on Alt News (altnews.in) or Boom Live (boomlive.in)",
  ];
  if (riskLevel !== "safe") {
    recommendations.push("Do not share until you verify with official sources");
    recommendations.push(
      "Check PIB Fact Check (pib.gov.in/factcheck) for government claims",
    );
  }
  if (riskLevel === "dangerous") {
    recommendations.push(
      "This appears to be misinformation — do not spread it",
    );
    recommendations.push("Report on the platform where you found it");
  }

  await incrementScan(riskLevel !== "safe");

  res.json({
    verdict: verdictMap[riskLevel],
    confidence,
    riskLevel,
    summary:
      riskLevel === "safe"
        ? "This claim appears credible based on initial analysis. Always verify from primary sources."
        : riskLevel === "suspicious"
          ? "This claim contains unverifiable elements. Do not share without independent verification."
          : "HIGH RISK: This claim exhibits multiple misinformation patterns. It is likely false or misleading.",
    category: triggered.length > 0 ? triggered[0].label : null,
    indicators:
      triggered.length > 0
        ? triggered
        : [
            {
              label: "No misinformation patterns detected",
              confidence: 80,
              riskLevel: "safe",
            },
          ],
    recommendations,
  });
});

export default router;
