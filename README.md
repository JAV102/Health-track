# HealthTrack

A personal wellness tracking website built with React. HealthTrack lets users
log daily meals, exercise sessions and general activity, and see their totals
update instantly on a dashboard.


## Pages

| Page | Description |
|------|-------------|
| Home | Landing page with a hero section and value highlights |
| Features | Overview of what the app can do, shown as cards |
| Dashboard | **Dynamic page** — log meals/exercise/activity, see live totals, delete entries |
| About | Information about the project |
| Contact | Contact form with client-side validation |

template: `App.js`
holds the current page in state, and clicking a nav link (a plain `onClick`
on an `<a>`, no routing library) swaps which page component is rendered —
there is no `react-router-dom` dependency and no URL changes.

## Tech Stack

- React 18 
- Plain CSS 
- `localStorage` 

## Setup Instructions

1. **Install prerequisites**: make sure [Node.js](https://nodejs.org) (v16 or later) and npm are installed.
   ```bash
   node -v
   npm -v
   ```

2. **Unzip the project** (if you received it as a `.zip`) and open the folder in VS Code:
   ```bash
   unzip healthtrack.zip
   cd healthtrack
   code .
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Run the development server**:
   ```bash
   npm start
   ```
   The app opens automatically at [http://localhost:3000](http://localhost:3000).

5. **Build for production** (optional, needed for deployment):
   ```bash
   npm run build
   ```
   This creates an optimized `build/` folder ready to deploy.

## Deploying

- **GitHub Pages**: add `"homepage": "https://<username>.github.io/<repo>"` to
  `package.json`, install `gh-pages` (`npm install --save-dev gh-pages`), add
  `"predeploy": "npm run build"` and `"deploy": "gh-pages -d build"` scripts,
  then run `npm run deploy`.
- **Vercel / Netlify**: connect the GitHub repository and use `npm run build`
  as the build command with `build` as the output directory.

## Project Structure

```
healthtrack/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── FeatureCard.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Features.jsx
│   │   ├── Dashboard.jsx
│   │   ├── About.jsx
│   │   └── Contact.jsx
│   ├── styles/
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```


```

