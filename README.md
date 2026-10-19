# REAL TIME SOCIAL MEDIA TREND PREDICTION AND DIFFUSION ANALYTICS
### High-End Enterprise Research & Intelligence Platform

An enterprise-grade, full-stack intelligence system and real-time interactive analytics dashboard designed to detect emerging social media topics, predict near-future popularity using Explainable AI (XGBoost), model information cascades through NetworkX and epidemiological SIR simulations, and generate multi-perspective, calibrated natural language insights without claiming false certainty.

---

## High-End Innovations & Architectural Blueprint

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    REAL-TIME SOCIAL MEDIA ANALYTICS PIPELINE                    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
           ┌────────────────────────────┴────────────────────────────┐
           ▼                                                         ▼
┌──────────────────────┐                                  ┌──────────────────────┐
│  DATA PREPROCESSING  │                                  │ TOPIC IDENTIFICATION │
│    Pandas + NumPy    │                                  │ TF-IDF + N-Grams     │
│   Sliding Windows    │                                  │  Bursting Terms      │
└──────────┬───────────┘                                  └──────────┬───────────┘
           │                                                         │
           └────────────────────────────┬────────────────────────────┘
                                        ▼
                   ┌──────────────────────────────────────────┐
                   │        TEMPORAL TREND DETECTION          │
                   │ Velocity (ΔV), Acceleration (a), Z-Score │
                   └────────────────────┬─────────────────────┘
                                        │
           ┌────────────────────────────┴────────────────────────────┐
           ▼                                                         ▼
┌──────────────────────────────┐                          ┌──────────────────────┐
│     DIFFUSION ANALYTICS      │                          │ POPULARITY PREDICTOR │
│   NetworkX Directed Graph    │                          │  XGBoost Regressor   │
│  Degree & Betweenness Cent.  │                          │  Explainable AI XAI  │
│  Louvain Community Detection │                          │ Baseline Comparisons │
│  Epidemic SIR Simulation (R₀)│                          │ 95% Confidence Bounds│
└──────────┬───────────────────┘                          └──────────┬───────────┘
           │                                                         │
           └────────────────────────────┬────────────────────────────┘
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    MODULE 6: AI TREND INSIGHT GENERATOR                         │
│  • Multi-Persona Briefing (Executive Briefing, Quant Deep Dive, PR Strategist)  │
│  • Mathematical Factor Decomposition of Score Movements                         │
│  • Interactive "Ask AI Trend Insight" Conversational Q&A Engine                 │
│  • Multi-Dimensional Head-to-Head Topic Comparator                              │
│  • Real-Time Event Injection Simulator (Viral Surge, KOL Blitz, Controversy)    │
│  • Multi-Page Executive PDF Dossier & Tabular CSV Exports                       │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Complete Module & Method Matrix

| # | Dashboard Module | Method / Algorithm | Key Implementations & High-End Features |
|---|---|---|---|
| **1** | **Data Preprocessing** | Pandas + NumPy | Real-time sliding window slicing ($\Delta t$), text cleaning, tokenization, missing value handling, engagement aggregation ($Likes + 2 \times RTs$). |
| **2** | **Topic Identification** | TF-IDF + Keyword Extraction | Salient unigram/bigram n-gram extraction, class-based TF-IDF, burst detection, top hashtag clustering. |
| **3** | **Trend Detection** | Sliding Window Analysis | Discrete 1st derivative velocity ($\Delta V$), 2nd derivative acceleration ($a$), relative growth rate, volume Z-scores, dynamic state classification (`Surging`, `Emerging`, `Steady`, `Decaying`, `Volatile`). |
| **4** | **Trend Scoring** | Weighted Trend Score | Multi-factor composite formula ($0-100$) combining velocity, acceleration, unique reach, volume, and sentiment intensity with exact percentage factor attribution. |
| **5** | **Popularity Prediction** | XGBoost Regressor | Autoregressive model fitted on lag volumes (`lag_1..4`), rolling momentum, and network ratios to forecast multi-step future horizons with 95% confidence bounds. |
| **6** | **Baseline Comparison** | Moving Average | Simple Moving Average (SMA-3) and Exponential Moving Average (EMA) calculated and plotted alongside XGBoost to evaluate non-linear divergence. |
| **7** | **Diffusion Analysis** | NetworkX Graph Analysis | Directed cascade network $G=(V, E)$, calculating graph density, cascade depth, clustering coefficients, and spring-layout coordinates for 2D visualization. |
| **8** | **Influential-User Analysis**| Degree & Betweenness Centrality | Distinguishes broadcast hubs (Degree Centrality) from bridge nodes linking disparate clusters (Betweenness Centrality). |
| **9** | **Community Analysis** | Louvain Community Detection | NetworkX Louvain modularity algorithm partitioning users into distinct echo chambers and computing Modularity Score $Q$. |
| **10** | **Alert Generation** | Threshold-Based Rules | Rule-based engine monitoring spike velocity, viral breakout scores, influencer infiltration, and sentiment polarization with prioritized severity levels (`CRITICAL`, `WARNING`, `INFO`). |
| **11** | **Dashboard Visualization**| React + Plotly | Interactive dark-theme dashboard with Plotly charts: Volume/Velocity bars, XGBoost Forecast with confidence bands, 2D NetworkX diffusion graph, and topic comparator. |
| **12** | **Performance Evaluation** | MAE, RMSE, Precision, Recall, F1 | Dual evaluation: Regression metrics (MAE, RMSE, MAPE) for XGBoost vs baseline, and Classification metrics (Precision, Recall, F1-Score, Confusion Matrix) for alert detection. |

---

## High-End Module Highlights

### 1. Epidemiological Diffusion Modeling & Basic Reproduction Number ($R_0$)
- In heterogeneous social graphs, diffusion is modeled as an **SIR (Susceptible-Infectious-Recovered)** epidemic cascade.
- Basic Reproduction Number $R_0 = \frac{\beta}{\gamma} \frac{\langle k^2 \rangle}{\langle k \rangle}$.
- **Supercritical ($R_0 > 1.0$)**: The topic has critical momentum to spread exponentially across communities without artificial boosting.
- **Subcritical ($R_0 < 1.0$)**: The cascade will naturally extinguish unless constantly reinforced by external seeds.

### 2. Explainable AI (XAI) Feature Importance
- Extracts tree split gains from `xgb.XGBRegressor` to explain *why* the forecast was made.
- Identifies the dominant predictive signals across immediate lag, rolling momentum, engagement intensity, sentiment valence, and user reach.

### 3. Multi-Persona AI Insights (Module 6)
- **Executive Briefing**: High-level market intelligence, brand safety, opportunity vs risk, plain-English summary without technical jargon.
- **Quant Data Scientist Deep Dive**: Mathematical factor attribution, $R_0$ reproduction number, velocity delta, XGBoost residual bounds, graph modularity $Q$, and turning point analysis.
- **PR & Crisis Response Strategist**: Virality tipping points, controversial sentiment flags, key opinion leader (KOL) engagement strategy, and countermeasures.

### 4. Interactive "Ask AI Trend Insight" Conversational Q&A
- Natural language query interface answering ad-hoc questions backed by live network and predictive metrics:
  - *"Will this trend peak in the next 12 hours?"*
  - *"Who is the primary influencer driving this?"*
  - *"Why did the trend score increase?"*
  - *"Is this trend organic or bot-driven?"*

### 5. Real-Time Shock Event Injection Simulator
- Injects realistic external shocks to test how the algorithms respond dynamically:
  - 💥 **Viral Surge Shock** (+120 posts, massive velocity acceleration)
  - 👑 **Mega-KOL Retweet Blitz** (TechOracle / 285k follower broadcast cascade)
  - ⚡ **Controversy & Polarization Crisis** (Negative sentiment shock triggering crisis alarms)

---

## Quickstart & Launch Guide

### 1-Click Launch (Windows)
Double-click `start.bat` or run:
```powershell
python run_servers.py
```
- **Backend API**: `http://localhost:5000`
- **Frontend Dashboard**: `http://localhost:3000` (auto-opens in your browser)

### Running Automated Test Suite
```powershell
cd backend
python test_api.py
```
*(All 11 enterprise test suites pass in ~3.9s: status, topics, multi-persona insights, Q&A querying, event injection, live feed, comparison, SIR cascade, XAI feature importances, CSV export, and PDF generation).*
## Live Demo

Visit the deployed Trend Analytics dashboard:
trend-analytics-k9v1.vercel.app
