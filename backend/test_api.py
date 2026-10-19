import unittest
from app import app, engine

class TestTrendAnalyticsAPI(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_status(self):
        res = self.client.get('/api/status')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'healthy')
        self.assertGreater(data['topics_monitored'], 0)

    def test_topics(self):
        res = self.client.get('/api/topics')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('topics', data)
        self.assertGreater(len(data['topics']), 0)

    def test_insights(self):
        topic_id = engine.latest_topics[0]['topic_id']
        res = self.client.get(f'/api/insights/{topic_id}')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('multi_persona', data)
        self.assertIn('score_explanation', data)
        self.assertIn('prediction_summary', data)
        print("Executive Briefing:", data['multi_persona']['executive_briefing'])
        print("Quant Deep Dive:", data['multi_persona']['quant_deep_dive'])

    def test_query_insight(self):
        topic_id = engine.latest_topics[0]['topic_id']
        res = self.client.post('/api/insights/query', json={
            "query": "Will this trend peak in the next 12 hours?",
            "topic_id": topic_id
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('answer', data)
        print("Ask AI Query Answer:", data['answer'])

    def test_inject_event(self):
        topic_id = engine.latest_topics[0]['topic_id']
        res = self.client.post('/api/simulate/inject_event', json={
            "topic_id": topic_id,
            "event_type": "viral_surge"
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('message', data)
        print("Injected Event Result:", data['message'])

    def test_live_posts(self):
        res = self.client.get('/api/posts/live')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('posts', data)
        self.assertGreater(len(data['posts']), 0)

    def test_create_custom_topic(self):
        res = self.client.post('/api/topics/create', json={
            "name": "#FinTechAI",
            "category": "Finance & Technology",
            "keywords": ["algorithmic", "defi", "trading", "fraud"],
            "profile": "emerging"
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('topic', data)
        self.assertEqual(data['topic']['topic_name'], '#FinTechAI')
        print("Created Custom Topic:", data['topic']['topic_name'], "Score:", data['topic']['trend_score'])

    def test_compare(self):
        res = self.client.get('/api/compare?t1=generative_ai&t2=quantum_sensing')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('summary_verdict', data)

    def test_network_and_sir(self):
        topic_id = engine.latest_topics[0]['topic_id']
        res = self.client.get(f'/api/network/{topic_id}')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('sir_simulation', data)
        print("SIR Simulation R0:", data['summary']['reproduction_number_r0'])

    def test_prediction_feature_importance(self):
        topic_id = engine.latest_topics[0]['topic_id']
        res = self.client.get(f'/api/prediction/{topic_id}')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('feature_importances', data['prediction'])
        print("Top XGBoost Feature:", data['prediction']['feature_importances'][0])

    def test_export_pdf(self):
        res = self.client.get('/api/export/pdf')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.content_type, 'application/pdf')

    def test_export_csv(self):
        res = self.client.get('/api/export/csv')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.content_type, 'text/csv; charset=utf-8')

    def test_cib_bot_detection(self):
        topic_id = engine.latest_topics[0]['topic_id']
        res = self.client.get(f'/api/network/{topic_id}')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('cib_analysis', data)
        cib = data['cib_analysis']
        self.assertIn('cib_score', cib)
        self.assertIn('organic_ratio', cib)
        self.assertIn('classification', cib)
        print(f"CIB Bot Analysis: {cib['classification']} (Organic: {cib['organic_ratio']}%, CIB Risk: {cib['cib_score']})")

    def test_search_content(self):
        res = self.client.get('/api/search?q=ai')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('matched_topics', data)
        self.assertIn('matched_posts', data)
        self.assertIn('sentiment_distribution', data)
        print(f"Global Search Results: {data['total_matches']} matched posts, {len(data['matched_topics'])} topics")

    def test_timeline_history(self):
        res = self.client.get('/api/timeline')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('windows', data)
        self.assertIn('timeline', data)
        self.assertGreater(len(data['windows']), 0)
        print(f"Timeline History: {len(data['windows'])} windows recorded for time-lapse player")

    def test_weights_configuration(self):
        res = self.client.post('/api/config/weights', json={
            "weights": {
                "growth_velocity": 0.45,
                "acceleration": 0.20,
                "network_spread": 0.15,
                "volume_scale": 0.10,
                "sentiment_intensity": 0.10
            },
            "horizon_steps": 12
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['horizon_steps'], 12)
        self.assertEqual(data['weights']['growth_velocity'], 0.45)

        # Reset
        res_reset = self.client.post('/api/config/reset_weights')
        self.assertEqual(res_reset.status_code, 200)
        data_reset = res_reset.get_json()
        self.assertEqual(data_reset['horizon_steps'], 6)
        print("Model Tuning Studio: dynamic weight re-scoring and reset verified successfully")

    def test_upload_instagram_csv_format(self):
        """Tests uploading an Instagram-style CSV with caption, likes, comments, username (no topic_id, no retweets)."""
        import io
        csv_content = """caption,likes,comments,username,date
Amazing sunset tonight! #photography #nature,450,32,photo_guru,2026-10-18 10:00:00
Best AI tools for creators in 2026 #ai #tech,1200,95,tech_insider,2026-10-18 11:30:00
Morning workout routine complete #fitness #health,340,18,fit_life,2026-10-18 12:45:00
New photo collection dropped! #photography #art,620,44,photo_guru,2026-10-18 14:15:00
Deep learning models getting faster #ai #coding,890,61,dev_lead,2026-10-18 15:00:00
Vegan meal prep ideas for the week #health #food,210,15,healthy_eats,2026-10-18 16:30:00
Camera settings for night portraits #photography,780,52,photo_guru,2026-10-18 18:00:00
Autonomous agents workflow demo #ai #tech,1450,110,tech_insider,2026-10-18 19:15:00
Leg day superset challenge #fitness #workout,490,29,fit_life,2026-10-18 20:45:00
Generative design for mobile apps #ai #design,980,73,dev_lead,2026-10-18 22:00:00
"""
        data = {
            'file': (io.BytesIO(csv_content.encode('utf-8')), 'Instagram - Posts.csv')
        }
        res = self.client.post('/api/upload', data=data, content_type='multipart/form-data')
        self.assertEqual(res.status_code, 200)
        res_data = res.get_json()
        self.assertIn('topics_detected', res_data)
        self.assertGreater(res_data['topics_detected'], 0)
        print(f"Uploaded Instagram - Posts.csv successfully! Detected {res_data['topics_detected']} topics across {len(engine.latest_topics)} monitored clusters.")

if __name__ == '__main__':
    unittest.main()
