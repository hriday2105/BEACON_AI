# Beacon AI 🛡️

**An open-source AI-powered digital protector.**

Every day, millions of people fall victim to phishing attacks, fake messages, fraudulent payment screenshots, deepfakes, misinformation, and other threats to their safety. Beacon AI helps people detect fraud, verify information, report dangers, and get help quickly — all in one platform.

Our goal is simple: **protection for everyone.**

---

## ✨ Features

- **🎯 Command Center** — Animated radar sweep with live stats pulled from the database (scans performed, threats blocked) and quick-access feature cards.
- **📱 Scam Detector** — Pattern-matches WhatsApp/SMS/email text against known scam fingerprints (urgency language, OTP requests, impersonation, fake job offers, etc.).
- **🔗 Phishing Scanner** — Checks URLs for IP-based links, suspicious TLDs, brand impersonation, URL shorteners, and missing HTTPS.
- **💳 Payment Detect** — Drag-and-drop a payment screenshot for forensic heuristic analysis (file integrity, metadata, platform-specific checks).
- **🎭 Deepfake Detector** — Drag-and-drop an image or video for GAN artifact detection, facial landmark analysis, and temporal consistency checks.
- **📰 Fact Checker** — Analyzes news claims for misinformation patterns and cross-references trusted sources.
- **🗺️ Threat Map** — Community-driven map of reported threats with a hotspot sidebar and a "Submit Report" flow.

No API key needed — all analysis runs server-side using heuristic engines.

---

## 🏗️ Tech Stack

- **TypeScript** (backend + frontend)
- **Express** — API server
- **CSS** — styling

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [pnpm](https://pnpm.io/) (this project uses `pnpm-lock.yaml`)

### Installation

```bash
# Clone the repository
git clone https://github.com/hriday2105/BEACON_AI.git
cd BEACON_AI

# Install dependencies
pnpm install
```

### Running locally

```bash
pnpm run dev
```

Check `package.json` for the exact scripts available in this project.

---

## 📂 Project Structure

```
BEACON_AI/
├── artifacts/       # API server, routes, and core logic
├── lib/             # Shared libraries/utilities
├── scripts/         # Build/dev scripts
├── package.json
└── tsconfig.json
```

---

## 🤝 Contributing

Beacon AI is open-source and contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add your feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

If you find bugs or have feature requests, please [open an issue](https://github.com/hriday2105/BEACON_AI/issues).

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgements

Built with the goal of giving everyone, everywhere, a simple way to protect themselves from digital threats.
