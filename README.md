# Zihan Zhai Personal Website

Static personal website for Zihan Zhai.

## AI assistant

The browser code never stores an OpenAI API key. The AI assistant calls `/api/ask`, a Vercel serverless function that reads `OPENAI_API_KEY` from environment variables.

To enable the smarter assistant:

1. Import this repository into Vercel.
2. Add an environment variable named `OPENAI_API_KEY`.
3. Optional: add `OPENAI_MODEL` if you want a model other than the default `gpt-5-mini`.
4. Deploy the site on Vercel.

GitHub Pages can still host the static site, but it cannot securely run the OpenAI API by itself. On GitHub Pages, the assistant falls back to the local curated answers.

## Publish with GitHub Pages

1. Create a public repository named `zhai08.github.io` under the GitHub account `zhai08`.
2. Upload `index.html`, `styles.css`, `script.js`, `.nojekyll`, and the `assets/hero-workspace.png` image.
3. In the repository settings, enable GitHub Pages from the `main` branch root.
4. The website will be available at `https://zhai08.github.io/`.

Do not upload `assets/Zihan_CV.pdf`; it contains private contact information.
