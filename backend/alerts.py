from datetime import datetime

class AlertEngine:
    """
    Module 10: Alert generation (Threshold-based rules)
    Monitors streaming trend dynamics against configured quantitative thresholds
    to generate real-time alerts with severity classifications and action triggers.
    """
    def __init__(self, thresholds=None):
        self.thresholds = thresholds or {
            "spike_velocity_ratio": 0.45,   # +45% volume surge window-over-window
            "viral_score_critical": 78.0,   # Trend score threshold for viral breakout
            "viral_score_warning": 62.0,    # Trend score elevated alert
            "acceleration_shock": 15.0,     # Rapid acceleration in post velocity
            "influencer_centrality": 0.12,  # Node centrality indicating bridge broadcast
            "sentiment_polarization": 0.70  # Strong positive or negative polarity
        }

    def generate_alerts(self, topics_data: list, network_summaries: dict = None) -> list:
        """
        Evaluates current topic metrics against threshold rules.
        Returns prioritized alerts sorted by severity (CRITICAL, WARNING, INFO).
        """
        alerts = []
        network_summaries = network_summaries or {}

        for topic in topics_data:
            topic_id = topic.get('topic_id')
            topic_name = topic.get('topic_name', topic_id)
            score = float(topic.get('trend_score', 0))
            score_delta = float(topic.get('score_delta', 0))
            rel_growth = float(topic.get('relative_growth_pct', 0)) / 100.0
            accel = float(topic.get('acceleration', 0))
            velocity = float(topic.get('velocity', 0))
            sentiment = float(topic.get('avg_sentiment', 0))
            cur_vol = int(topic.get('current_volume', topic.get('volume', 0)))

            # Rule 1: Viral Breakout Alert (CRITICAL)
            if score >= self.thresholds['viral_score_critical'] and accel > 0:
                alerts.append({
                    "id": f"alt_viral_{topic_id}_{datetime.now().strftime('%H%M%S')}",
                    "topic_id": topic_id,
                    "topic_name": topic_name,
                    "severity": "CRITICAL",
                    "type": "Viral Breakout Risk",
                    "title": f"High Viral Breakout Probability on {topic_name}",
                    "message": (
                        f"Trend score reached {score}/100 with positive acceleration (+{accel:.1f}). "
                        f"Information cascade is spreading across multiple user clusters."
                    ),
                    "metric_trigger": f"Score: {score} (Threshold: {self.thresholds['viral_score_critical']})",
                    "timestamp": datetime.now().isoformat(),
                    "recommended_action": "Prioritize real-time monitoring and alert social response teams."
                })

            # Rule 2: Sudden Volume Spike Alert (WARNING)
            elif rel_growth >= self.thresholds['spike_velocity_ratio'] and cur_vol > 30:
                alerts.append({
                    "id": f"alt_spike_{topic_id}_{datetime.now().strftime('%H%M%S')}",
                    "topic_id": topic_id,
                    "topic_name": topic_name,
                    "severity": "WARNING",
                    "type": "Velocity Spike",
                    "title": f"Sudden Volume Spike on {topic_name}",
                    "message": (
                        f"Volume jumped by {round(rel_growth * 100, 1)}% (+{velocity} posts) compared to prior window. "
                        f"Sliding window z-score indicates abnormal conversational influx."
                    ),
                    "metric_trigger": f"Growth: +{round(rel_growth * 100, 1)}% (Threshold: +{int(self.thresholds['spike_velocity_ratio']*100)}%)",
                    "timestamp": datetime.now().isoformat(),
                    "recommended_action": "Check for breaking external news or viral seed content."
                })

            # Rule 3: Influencer Network Infiltration (INFO / WARNING)
            net_info = network_summaries.get(topic_id, {})
            top_hub = net_info.get('top_hub')
            if top_hub and top_hub != "None" and net_info.get('network_density', 0) > 0.05:
                alerts.append({
                    "id": f"alt_hub_{topic_id}_{datetime.now().strftime('%H%M%S')}",
                    "topic_id": topic_id,
                    "topic_name": topic_name,
                    "severity": "INFO",
                    "type": "Influencer Amplification",
                    "title": f"Influential Node Amplifying {topic_name}",
                    "message": (
                        f"User '{top_hub}' entered the transmission cascade with high network centrality. "
                        f"Expected diffusion reach may expand across community boundaries."
                    ),
                    "metric_trigger": f"Hub Node: {top_hub}",
                    "timestamp": datetime.now().isoformat(),
                    "recommended_action": "Track retweets and secondary cascades from this hub."
                })

            # Rule 4: Sentiment Polarity Anomaly
            if abs(sentiment) >= self.thresholds['sentiment_polarization']:
                pol_type = "Strongly Positive" if sentiment > 0 else "Strongly Negative / Polarized"
                alerts.append({
                    "id": f"alt_sent_{topic_id}_{datetime.now().strftime('%H%M%S')}",
                    "topic_id": topic_id,
                    "topic_name": topic_name,
                    "severity": "WARNING" if sentiment < 0 else "INFO",
                    "type": "Sentiment Shift",
                    "title": f"{pol_type} Sentiment on {topic_name}",
                    "message": (
                        f"Mean conversational sentiment reached {sentiment:+.2f}. "
                        f"Discussions exhibit significant emotional consensus or friction."
                    ),
                    "metric_trigger": f"Sentiment: {sentiment:+.2f}",
                    "timestamp": datetime.now().isoformat(),
                    "recommended_action": "Analyze keyword context to differentiate advocacy from controversy."
                })

        # Order by severity priority
        severity_order = {"CRITICAL": 0, "WARNING": 1, "INFO": 2}
        alerts.sort(key=lambda a: severity_order.get(a['severity'], 3))
        return alerts
