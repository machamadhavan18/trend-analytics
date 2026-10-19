import io
import os
import json
import math
import re
import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from flask import Flask, jsonify, request, send_file, Response
from flask_cors import CORS

from data_generator import generate_social_media_stream, TOPIC_SEEDS, INFLUENTIAL_USERS, add_custom_topic_seed
from preprocessing import DataPreprocessor
from topic_identification import TopicIdentifier
from trend_detection import TrendDetector
from trend_scoring import TrendScorer
from diffusion_analyzer import DiffusionAnalyzer
from predictor import PopularityPredictor
from alerts import AlertEngine
from insight_generator import AITrendInsightGenerator
from evaluation import ModelEvaluator
from export_service import ExportService

app = Flask(__name__)
CORS(app)

@app.after_request
def sanitize_json_response(response):
    """
    Enterprise JSON Validator:
    RFC 8259 forbids NaN, Infinity, and -Infinity in standard JSON.
    Standard browser JSON.parse will throw a SyntaxError if NaN is encountered.
    This hook intercepts all JSON responses and replaces literal NaN/Infinity with null.
    """
    if response.mimetype == 'application/json':
        try:
            raw_text = response.get_data(as_text=True)
            if 'NaN' in raw_text or 'Infinity' in raw_text:
                clean_text = re.sub(r'\bNaN\b', 'null', raw_text)
                clean_text = re.sub(r'\b-?Infinity\b', 'null', clean_text)
                response.set_data(clean_text)
        except Exception:
            pass
    return response

class TrendAnalyticsEngine:
    """
    Enterprise Real-Time Trend Prediction & Diffusion Engine
    """
    def __init__(self, initial_windows=16):
        self.preprocessor = DataPreprocessor(window_size_hours=1)
        self.topic_identifier = TopicIdentifier(max_features=800)
        self.trend_detector = TrendDetector()
        self.trend_scorer = TrendScorer()
        self.diffusion_analyzer = DiffusionAnalyzer()
        self.predictor = PopularityPredictor(horizon_steps=6)
        self.alert_engine = AlertEngine()
        self.insight_generator = AITrendInsightGenerator()
        self.evaluator = ModelEvaluator()
        self.exporter = ExportService()

        self.current_window = initial_windows
        self.raw_posts = generate_social_media_stream(num_windows=self.current_window)
        self._recompute_all()

    def _recompute_all(self):
        # 1. Preprocessing
        self.df_posts = self.preprocessor.preprocess_posts(self.raw_posts)
        self.df_aggregated = self.preprocessor.aggregate_by_window_and_topic(self.df_posts)

        # 2. Topic Identification
        self.topic_keywords = self.topic_identifier.extract_keywords_per_topic(self.df_posts)

        # 3. Trend Detection
        self.df_detected = self.trend_detector.analyze_sliding_windows(self.df_aggregated)

        # Update raw_posts to the cleaned normalized records without NaN
        clean_df = self.df_posts.where(pd.notnull(self.df_posts), None)
        self.raw_posts = clean_df.to_dict(orient='records')

        # 4. Trend Scoring
        self.df_scored = self.trend_scorer.compute_scores(self.df_detected)

        if not self.df_scored.empty and 'window_index' in self.df_scored.columns:
            self.current_window = max(1, int(self.df_scored['window_index'].max()) + 1)

        # Determine all active topic IDs (from uploaded dataset or seed defaults)
        active_topic_ids = list(self.df_scored['topic_id'].unique())
        if not active_topic_ids:
            active_topic_ids = [t['id'] for t in TOPIC_SEEDS]

        # 7, 8, 9: Diffusion Networks & Centralities + SIR Cascade
        self.networks = {}
        for tid in active_topic_ids:
            G = self.diffusion_analyzer.build_diffusion_network(self.raw_posts, topic_id=tid)
            self.networks[tid] = self.diffusion_analyzer.analyze_network(G, topic_id=tid)

        # Latest summary list
        latest_items = self.trend_detector.get_latest_window_comparison(self.df_scored)
        self.latest_topics = []

        for item in latest_items:
            tid = item['topic_id']
            subset = self.df_scored[(self.df_scored['topic_id'] == tid) & (self.df_scored['window_index'] == item['window_index'])]
            if not subset.empty:
                row = subset.iloc[0]
                decomp = self.trend_scorer.decompose_score_increase(row)
                item['trend_score'] = decomp['trend_score']
                item['score_delta'] = decomp['score_delta']
                item['primary_driver'] = decomp['primary_driver']
                item['primary_driver_pct'] = decomp['primary_driver_pct']
                item['attributions'] = decomp['attributions']
            else:
                item['trend_score'] = 50.0
                item['score_delta'] = 0.0
                item['primary_driver'] = 'Velocity Surge'
                item['primary_driver_pct'] = 35.0
                item['attributions'] = {}

            kw_data = self.topic_keywords.get(tid, {})
            item['keywords'] = [k['term'] for k in kw_data.get('keywords', [])[:4]]
            item['top_hashtags'] = kw_data.get('top_hashtags', [])
            item['network_summary'] = self.networks.get(tid, {}).get('summary', {})
            item['cib_analysis'] = self.networks.get(tid, {}).get('cib_analysis', {})
            self.latest_topics.append(item)

        self.latest_topics.sort(key=lambda x: x['trend_score'], reverse=True)

        # 5 & 6: XGBoost Predictions with Feature Importance
        self.predictions = {}
        for tid in active_topic_ids:
            self.predictions[tid] = self.predictor.fit_and_predict(self.df_scored, tid)

        # 10: Threshold Alerts
        net_summaries = {tid: self.networks[tid].get('summary', {}) for tid in self.networks}
        self.alerts = self.alert_engine.generate_alerts(self.latest_topics, net_summaries)

        # 12: Model Evaluation
        self.evaluation = self.evaluator.run_full_evaluation(self.df_scored)

        # 6: Multi-Persona AI Trend Insights
        self.insights = {}
        for topic in self.latest_topics:
            tid = topic['topic_id']
            net_sum = self.networks.get(tid, {}).get('summary', {})
            pred_data = self.predictions.get(tid, {})

            decomp = {
                'trend_score': topic.get('trend_score', 50),
                'score_delta': topic.get('score_delta', 0),
                'attributions': topic.get('attributions', {})
            }

            multi_persona = self.insight_generator.generate_multi_persona_insights(topic, net_sum, pred_data)
            score_exp = self.insight_generator.explain_score_increase(topic, decomp)
            pred_exp = self.insight_generator.summarize_predictions(pred_data, topic.get('topic_name'))

            self.insights[tid] = {
                "multi_persona": multi_persona,
                "general_explanation": {
                    "topic_id": tid,
                    "topic_name": topic.get('topic_name'),
                    "headline": multi_persona["headline"],
                    "full_explanation": multi_persona["full_explanation"],
                    "trend_score": topic.get('trend_score'),
                    "score_delta": topic.get('score_delta'),
                    "recommendation": "High observation priority: Prepare dynamic monitoring" if topic.get('trend_score') > 70 else "Maintain regular baseline tracking."
                },
                "score_explanation": score_exp,
                "prediction_summary": pred_exp
            }

    def advance_simulation(self):
        self.current_window += 1
        new_posts = generate_social_media_stream(num_windows=1)
        for p in new_posts:
            p['window_index'] = self.current_window - 1
            p['post_id'] = f"{p['post_id']}_step{self.current_window}"
        
        self.raw_posts.extend(new_posts)
        if self.current_window > 30:
            min_w = self.current_window - 30
            self.raw_posts = [p for p in self.raw_posts if p.get('window_index', 0) >= min_w]

        self._recompute_all()
        return self.current_window

    def reset_simulation(self):
        self.current_window = 16
        self.raw_posts = generate_social_media_stream(num_windows=self.current_window)
        self._recompute_all()

    def inject_event(self, topic_id: str, event_type: str):
        """
        High-End Feature: Injects real-world shocks to test system response.
        - 'viral_surge': Explosive +150 posts, high velocity
        - 'kol_boost': High centrality influencer retweet blitz
        - 'controversy_shock': Polarized sentiment spike
        """
        now = datetime.now()
        target_seed = next((t for t in TOPIC_SEEDS if t['id'] == topic_id), TOPIC_SEEDS[0])
        kw = target_seed['keywords']
        new_posts = []

        if event_type == 'viral_surge':
            count = 120
            for i in range(count):
                new_posts.append({
                    "post_id": f"event_viral_{self.current_window}_{i}",
                    "window_index": self.current_window - 1,
                    "timestamp": now.isoformat(),
                    "topic_id": topic_id,
                    "topic_name": target_seed['name'],
                    "category": target_seed['category'],
                    "author_id": f"user_viral_{i}",
                    "author_name": f"user_viral_{i}",
                    "author_followers": random.randint(500, 15000),
                    "text": f"BREAKING: Huge viral breakthrough in {target_seed['name']}! Massive advancements in {kw[0]} and {kw[1]} announced right now!",
                    "sentiment": 0.88,
                    "likes": random.randint(50, 400),
                    "retweets": random.randint(25, 200),
                    "is_retweet": True,
                    "retweet_of_user": "u_tech_oracle",
                    "hashtags": [target_seed['name'], f"#{kw[0]}", "#ViralAlert"]
                })
        elif event_type == 'kol_boost':
            mega_kol = INFLUENTIAL_USERS[0]
            for i in range(60):
                new_posts.append({
                    "post_id": f"event_kol_{self.current_window}_{i}",
                    "window_index": self.current_window - 1,
                    "timestamp": now.isoformat(),
                    "topic_id": topic_id,
                    "topic_name": target_seed['name'],
                    "category": target_seed['category'],
                    "author_id": mega_kol['user_id'] if i == 0 else f"follower_{i}",
                    "author_name": mega_kol['name'] if i == 0 else f"follower_{i}",
                    "author_followers": mega_kol['followers'] if i == 0 else 1200,
                    "text": f"Major analysis on {target_seed['name']}: {kw[0]} is completely transforming the landscape.",
                    "sentiment": 0.65,
                    "likes": 850 if i == 0 else random.randint(20, 80),
                    "retweets": 420 if i == 0 else random.randint(10, 40),
                    "is_retweet": i != 0,
                    "retweet_of_user": mega_kol['user_id'],
                    "hashtags": [target_seed['name'], "#InfluencerCascade"]
                })
        elif event_type == 'controversy_shock':
            for i in range(80):
                new_posts.append({
                    "post_id": f"event_crisis_{self.current_window}_{i}",
                    "window_index": self.current_window - 1,
                    "timestamp": now.isoformat(),
                    "topic_id": topic_id,
                    "topic_name": target_seed['name'],
                    "category": target_seed['category'],
                    "author_id": f"critic_{i}",
                    "author_name": f"critic_{i}",
                    "author_followers": random.randint(1000, 30000),
                    "text": f"Controversy erupts regarding {target_seed['name']}: serious vulnerabilities discovered in {kw[0]} frameworks.",
                    "sentiment": -0.78,
                    "likes": random.randint(60, 250),
                    "retweets": random.randint(30, 150),
                    "is_retweet": random.random() < 0.5,
                    "retweet_of_user": "critic_0",
                    "hashtags": [target_seed['name'], "#Debate", "#RiskAnalysis"]
                })

        self.raw_posts.extend(new_posts)
        self._recompute_all()
        return len(new_posts)

    def get_timeline(self):
        """
        Returns complete temporal trajectory histories across all observation windows
        for historical scrubbing and time-lapse replay.
        """
        windows = sorted([int(w) for w in self.df_scored['window_index'].unique()])
        timeline_dict = {}
        for tid in self.df_scored['topic_id'].unique():
            subset = self.df_scored[self.df_scored['topic_id'] == tid].sort_values(by='window_index')
            topic_seed = next((t for t in TOPIC_SEEDS if t['id'] == tid), None)
            name = topic_seed['name'] if topic_seed else tid
            series = []
            for _, row in subset.iterrows():
                series.append({
                    "window_index": int(row['window_index']),
                    "volume": int(row.get('volume', 0)),
                    "velocity": int(row.get('velocity', 0)),
                    "acceleration": int(row.get('acceleration', 0)),
                    "trend_score": float(row.get('trend_score', 0)),
                    "avg_sentiment": round(float(row.get('avg_sentiment', 0)), 3)
                })
            timeline_dict[tid] = {
                "topic_id": tid,
                "topic_name": name,
                "series": series
            }
        return {
            "current_window": self.current_window,
            "windows": windows,
            "timeline": timeline_dict
        }

    def search_content(self, query: str):
        """
        High-End Global Content Discovery & Semantic Keyword Search Engine:
        Searches across posts, keywords, hashtags, and topic metadata.
        Returns matching topics, matched posts with sentiment badges, and co-occurring terms.
        """
        if not query or not query.strip():
            return {
                "query": "",
                "total_matches": 0,
                "matched_topics": [],
                "matched_posts": [],
                "sentiment_distribution": {"positive": 0, "neutral": 0, "negative": 0, "positive_pct": 0, "neutral_pct": 0, "negative_pct": 0},
                "co_occurring_terms": []
            }
        
        q = query.strip().lower()
        matched_posts = []
        pos_count = 0
        neg_count = 0
        neut_count = 0
        topic_match_counts = {}
        word_freq = {}

        for p in reversed(self.raw_posts):
            text = (p.get('text') or '').lower()
            t_name = (p.get('topic_name') or '').lower()
            hashtags = [h.lower() for h in p.get('hashtags', [])]
            author = (p.get('author_name') or '').lower()

            is_match = (
                q in text or
                q in t_name or
                any(q in h for h in hashtags) or
                q in author
            )

            if is_match:
                matched_posts.append(p)
                tid = p.get('topic_id')
                topic_match_counts[tid] = topic_match_counts.get(tid, 0) + 1

                sent = p.get('sentiment', 0.0)
                if sent > 0.15:
                    pos_count += 1
                elif sent < -0.15:
                    neg_count += 1
                else:
                    neut_count += 1

                words = [w.strip('#,.:;!?()"\'') for w in text.split()]
                for w in words:
                    if len(w) > 3 and w != q and w not in ['this', 'that', 'with', 'from', 'have', 'were', 'been', 'about', 'more']:
                        word_freq[w] = word_freq.get(w, 0) + 1

        matched_topics = []
        for tid, count in sorted(topic_match_counts.items(), key=lambda x: x[1], reverse=True):
            topic_obj = next((t for t in self.latest_topics if t['topic_id'] == tid), None)
            if topic_obj:
                matched_topics.append({
                    "topic_id": tid,
                    "topic_name": topic_obj.get('topic_name'),
                    "match_count": count,
                    "trend_score": topic_obj.get('trend_score'),
                    "trend_state": topic_obj.get('trend_state'),
                    "relative_growth_pct": topic_obj.get('relative_growth_pct'),
                    "avg_sentiment": topic_obj.get('avg_sentiment')
                })

        co_occurring = [
            {"term": term, "count": cnt}
            for term, cnt in sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:12]
        ]

        total_matched = len(matched_posts)
        return {
            "query": query,
            "total_matches": total_matched,
            "matched_topics": matched_topics,
            "matched_posts": matched_posts[:30],
            "sentiment_distribution": {
                "positive": pos_count,
                "neutral": neut_count,
                "negative": neg_count,
                "positive_pct": round((pos_count / max(1, total_matched)) * 100, 1),
                "neutral_pct": round((neut_count / max(1, total_matched)) * 100, 1),
                "negative_pct": round((neg_count / max(1, total_matched)) * 100, 1)
            },
            "co_occurring_terms": co_occurring
        }

    def update_weights(self, weights: dict, horizon: int = 6):
        """
        Updates scoring weights dynamically and triggers instant recalculation.
        """
        for k in ['growth_velocity', 'acceleration', 'network_spread', 'volume_scale', 'sentiment_intensity']:
            if k in weights:
                self.trend_scorer.weights[k] = float(weights[k])
        
        if horizon and horizon in [3, 6, 12, 24]:
            self.predictor.horizon_steps = horizon

        self._recompute_all()
        return {
            "weights": self.trend_scorer.weights,
            "horizon_steps": self.predictor.horizon_steps
        }

    def reset_weights(self):
        self.trend_scorer.weights = {
            "growth_velocity": 0.35,
            "acceleration": 0.25,
            "network_spread": 0.20,
            "volume_scale": 0.10,
            "sentiment_intensity": 0.10
        }
        self.predictor.horizon_steps = 6
        self._recompute_all()
        return {
            "weights": self.trend_scorer.weights,
            "horizon_steps": self.predictor.horizon_steps
        }

    def add_topic(self, name: str, category: str = "Technology", keywords: list = None, profile: str = "emerging"):
        """Dynamically adds a custom topic and generates its temporal stream history."""
        seed = add_custom_topic_seed(name, category, keywords, profile)
        new_topic_posts = generate_social_media_stream(num_windows=self.current_window, topic_list=[seed])
        self.raw_posts.extend(new_topic_posts)
        self._recompute_all()
        return seed

engine = TrendAnalyticsEngine()

# ----------------- REST API Endpoints ----------------- #

@app.route('/api/topics/create', methods=['POST'])
def create_topic():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    if not name:
        return jsonify({"error": "Topic name is required"}), 400
    category = data.get('category', 'Technology')
    keywords = data.get('keywords', [])
    profile = data.get('profile', 'emerging')

    seed = engine.add_topic(name, category, keywords, profile)
    created_topic = next((t for t in engine.latest_topics if t['topic_id'] == seed['id']), None)
    return jsonify({
        "message": f"Topic '{seed['name']}' created and analyzed successfully.",
        "topic": created_topic,
        "topics_count": len(engine.latest_topics)
    })

@app.route('/api/search', methods=['GET'])
def search_api():
    """High-End Global Content Discovery & Semantic Keyword Search Engine."""
    q = request.args.get('q', '').strip()
    result = engine.search_content(q)
    return jsonify(result)

@app.route('/api/timeline', methods=['GET'])
def get_timeline_api():
    """Historical multi-window timeline data for time-lapse player and temporal scrubbing."""
    return jsonify(engine.get_timeline())

@app.route('/api/config/weights', methods=['GET', 'POST'])
def manage_weights():
    """Interactive Scoring Weight & Hyperparameter Configuration Studio."""
    if request.method == 'GET':
        return jsonify({
            "weights": engine.trend_scorer.weights,
            "horizon_steps": engine.predictor.horizon_steps
        })
    data = request.get_json() or {}
    new_weights = data.get('weights', {})
    horizon = int(data.get('horizon_steps', 6))
    res = engine.update_weights(new_weights, horizon=horizon)
    return jsonify({
        "message": "Weights updated and all trend scores recalculated.",
        "weights": res['weights'],
        "horizon_steps": res['horizon_steps'],
        "topics": engine.latest_topics
    })

@app.route('/api/config/reset_weights', methods=['POST'])
def reset_weights_api():
    res = engine.reset_weights()
    return jsonify({
        "message": "Weights reset to default configuration.",
        "weights": res['weights'],
        "horizon_steps": res['horizon_steps'],
        "topics": engine.latest_topics
    })


@app.route('/', methods=['GET'])
def root_index():
    return jsonify({
        "project": "REAL TIME SOCIAL MEDIA TREND PREDICTION AND DIFFUSION ANALYTICS",
        "module_6": "AI Trend Insight Generator",
        "status": "online",
        "current_window": engine.current_window,
        "topics_monitored": len(engine.latest_topics),
        "frontend_recommended": "http://localhost:5173",
        "endpoints": [
            "/api/status",
            "/api/topics",
            "/api/insights/<topic_id>",
            "/api/compare?t1=generative_ai&t2=quantum_sensing",
            "/api/prediction/<topic_id>",
            "/api/network/<topic_id>",
            "/api/alerts",
            "/api/evaluation",
            "/api/export/csv",
            "/api/export/pdf"
        ]
    })

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({
        "status": "healthy",
        "current_window": engine.current_window,
        "total_posts_analyzed": len(engine.raw_posts),
        "topics_monitored": len(engine.latest_topics),
        "active_alerts": len(engine.alerts)
    })

@app.route('/api/topics', methods=['GET'])
def get_topics():
    return jsonify({
        "topics": engine.latest_topics,
        "current_window": engine.current_window
    })

@app.route('/api/topic/<topic_id>', methods=['GET'])
def get_topic_detail(topic_id):
    subset = engine.df_scored[engine.df_scored['topic_id'] == topic_id].sort_values(by='window_index')
    if subset.empty:
        return jsonify({"error": f"Topic {topic_id} not found"}), 404

    history = []
    for _, row in subset.iterrows():
        history.append({
            "window_index": int(row['window_index']),
            "volume": int(row['volume']),
            "velocity": int(row.get('velocity', 0)),
            "acceleration": int(row.get('acceleration', 0)),
            "trend_score": float(row.get('trend_score', 0)),
            "avg_sentiment": round(float(row.get('avg_sentiment', 0)), 3),
            "total_engagement": int(row.get('total_engagement', 0)),
            "unique_authors": int(row.get('unique_authors', 0))
        })

    latest_info = next((t for t in engine.latest_topics if t['topic_id'] == topic_id), {})
    kw_info = engine.topic_keywords.get(topic_id, {})

    return jsonify({
        "topic_id": topic_id,
        "summary": latest_info,
        "history": history,
        "keywords": kw_info.get('keywords', []),
        "top_hashtags": kw_info.get('top_hashtags', []),
        "sample_post": kw_info.get('sample_post', '')
    })

@app.route('/api/insights/<topic_id>', methods=['GET'])
def get_insights(topic_id):
    insight_entry = engine.insights.get(topic_id)
    if not insight_entry:
        return jsonify({"error": f"Insights for {topic_id} not found"}), 404
    return jsonify(insight_entry)

@app.route('/api/insights/query', methods=['POST'])
def query_insight():
    """
    High-End Interactive Query Engine: 'Ask AI Trend Insight'
    """
    data = request.get_json() or {}
    query = data.get('query', '')
    topic_id = data.get('topic_id', engine.latest_topics[0]['topic_id'])

    topic_data = next((t for t in engine.latest_topics if t['topic_id'] == topic_id), engine.latest_topics[0])
    net_sum = engine.networks.get(topic_id, {}).get('summary', {})
    pred_data = engine.predictions.get(topic_id, {})

    answer = engine.insight_generator.answer_custom_query(query, topic_data, net_sum, pred_data)
    return jsonify(answer)

@app.route('/api/posts/live', methods=['GET'])
def get_live_posts():
    """Returns recent streaming posts for the ticker/feed."""
    topic_id = request.args.get('topic_id')
    posts = engine.raw_posts
    if topic_id:
        posts = [p for p in posts if p.get('topic_id') == topic_id]
    
    # Return last 25 posts
    recent = posts[-25:]
    recent.reverse()
    return jsonify({
        "posts": recent,
        "total_stream_count": len(posts)
    })

@app.route('/api/simulate/inject_event', methods=['POST'])
def inject_event():
    """High-End Real-Time Event Injection."""
    data = request.get_json() or {}
    topic_id = data.get('topic_id', 'generative_ai')
    event_type = data.get('event_type', 'viral_surge')

    injected_count = engine.inject_event(topic_id, event_type)
    return jsonify({
        "message": f"Successfully injected {event_type} ({injected_count} posts) into topic {topic_id}.",
        "topic_id": topic_id,
        "current_window": engine.current_window,
        "active_alerts": len(engine.alerts)
    })

@app.route('/api/compare', methods=['GET'])
def compare_topics():
    t1 = request.args.get('t1')
    t2 = request.args.get('t2')

    topic_a = next((t for t in engine.latest_topics if t['topic_id'] == t1), None) if t1 else None
    topic_b = next((t for t in engine.latest_topics if t['topic_id'] == t2), None) if t2 else None

    # Fallback to available topics if specified ones not found
    if not topic_a and len(engine.latest_topics) > 0:
        topic_a = engine.latest_topics[0]
    if not topic_b and len(engine.latest_topics) > 1:
        topic_b = engine.latest_topics[1]
    elif not topic_b and len(engine.latest_topics) > 0:
        topic_b = engine.latest_topics[0]

    if not topic_a or not topic_b:
        return jsonify({"error": "No topics available for comparison"}), 400

    tid_a = topic_a['topic_id']
    tid_b = topic_b['topic_id']

    net_a = engine.networks.get(tid_a, {}).get('summary', {})
    net_b = engine.networks.get(tid_b, {}).get('summary', {})
    pred_a = engine.predictions.get(tid_a, {})
    pred_b = engine.predictions.get(tid_b, {})

    comparison = engine.insight_generator.compare_two_topics(
        topic_a, topic_b, net_a=net_a, net_b=net_b, pred_a=pred_a, pred_b=pred_b
    )
    return jsonify(comparison)

@app.route('/api/prediction/<topic_id>', methods=['GET'])
def get_prediction(topic_id):
    pred = engine.predictions.get(topic_id)
    if not pred:
        return jsonify({"error": f"Prediction for {topic_id} not found"}), 404

    topic_name = next((t['topic_name'] for t in engine.latest_topics if t['topic_id'] == topic_id), topic_id)
    summary_text = engine.insight_generator.summarize_predictions(pred, topic_name)

    return jsonify({
        "prediction": pred,
        "ai_summary": summary_text
    })

@app.route('/api/network/<topic_id>', methods=['GET'])
def get_network(topic_id):
    net = engine.networks.get(topic_id)
    if not net:
        return jsonify({"error": f"Network for {topic_id} not found"}), 404
    return jsonify(net)

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    return jsonify({
        "alerts": engine.alerts,
        "count": len(engine.alerts)
    })

@app.route('/api/evaluation', methods=['GET'])
def get_evaluation():
    return jsonify(engine.evaluation)

@app.route('/api/simulate/step', methods=['POST'])
def simulate_step():
    new_window = engine.advance_simulation()
    return jsonify({
        "message": "Advanced simulation by 1 window interval.",
        "current_window": new_window,
        "total_posts": len(engine.raw_posts),
        "alerts_count": len(engine.alerts)
    })

@app.route('/api/simulate/reset', methods=['POST'])
def simulate_reset():
    engine.reset_simulation()
    return jsonify({
        "message": "Simulation reset successfully.",
        "current_window": engine.current_window
    })

@app.route('/api/upload', methods=['POST'])
def upload_data():
    if 'file' not in request.files:
        return jsonify({"error": "No file part provided in request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        if file.filename.endswith('.json'):
            data = json.load(file)
            if not isinstance(data, list):
                return jsonify({"error": "JSON file must contain an array of post objects"}), 400
            engine.raw_posts = data
        elif file.filename.endswith('.csv'):
            import pandas as pd
            # Robust encoding fallbacks (UTF-8, UTF-8-SIG, Latin-1, CP1252)
            try:
                df_in = pd.read_csv(file, encoding='utf-8')
            except UnicodeDecodeError:
                file.seek(0)
                try:
                    df_in = pd.read_csv(file, encoding='utf-8-sig')
                except UnicodeDecodeError:
                    file.seek(0)
                    df_in = pd.read_csv(file, encoding='latin-1')

            # Cap large datasets to top 15,000 records to guarantee sub-second dashboard performance
            if len(df_in) > 15000:
                df_in = df_in.head(15000)

            # Convert to dictionary records for ingestion
            engine.raw_posts = df_in.to_dict(orient='records')
        else:
            return jsonify({"error": "Unsupported file format. Please upload CSV or JSON"}), 400

        engine._recompute_all()
        return jsonify({
            "message": f"Successfully ingested {len(engine.raw_posts)} records across {len(engine.latest_topics)} detected topics.",
            "topics_detected": len(engine.latest_topics),
            "current_window": engine.current_window
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to parse uploaded dataset: {str(e)}"}), 500

@app.route('/api/export/csv', methods=['GET'])
def export_csv():
    tid = request.args.get('topic_id')
    if tid:
        filtered = [t for t in engine.latest_topics if t['topic_id'] == tid]
    else:
        filtered = engine.latest_topics

    csv_data = engine.exporter.export_topics_csv(filtered, engine.predictions)
    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=trend_analytics_export.csv"}
    )

@app.route('/api/export/pdf', methods=['GET'])
def export_pdf():
    insights_list = [v['general_explanation'] for v in engine.insights.values()]
    pdf_bytes = engine.exporter.generate_pdf_report(
        topics_data=engine.latest_topics,
        insights_data=insights_list,
        predictions_dict=engine.predictions,
        evaluation_data=engine.evaluation
    )
    return send_file(
        io.BytesIO(pdf_bytes),
        mimetype="application/pdf",
        as_attachment=True,
        download_name="AI_Trend_Insight_Report.pdf"
    )

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Real-Time Social Media Trend Prediction & Diffusion Analytics on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
