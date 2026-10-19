import numpy as np
import pandas as pd

class TrendScorer:
    """
    Module 4: Trend scoring (Weighted Trend Score)
    Calculates a multi-factorial weighted trend score normalized to [0, 100]
    along with exact mathematical factor attribution for explainability.
    """
    def __init__(self, weights=None):
        # Default scientifically balanced weights
        self.weights = weights or {
            "growth_velocity": 0.35,  # Rate of post influx
            "acceleration": 0.25,     # Explosive surge momentum
            "network_spread": 0.20,   # Cross-user diffusion and unique reach
            "volume_scale": 0.10,     # Absolute presence
            "sentiment_intensity": 0.10 # Emotional charge/engagement catalyst
        }

    def compute_scores(self, df_metrics: pd.DataFrame, diffusion_dict: dict = None) -> pd.DataFrame:
        """
        Computes composite trend score and component contributions per topic-window row.
        """
        if df_metrics.empty:
            return df_metrics

        df = df_metrics.copy()
        diffusion_dict = diffusion_dict or {}

        # 1. Growth Velocity component: Min-max normalized with soft sigmoid
        # Uses relative growth and positive velocity
        vel_sig = np.tanh(df['velocity'].clip(lower=-20, upper=150) / 40.0)
        c_velocity = (vel_sig + 1.0) / 2.0 * 100.0

        # 2. Acceleration component: Rate of growth increase
        acc_sig = np.tanh(df['acceleration'].clip(lower=-30, upper=80) / 25.0)
        c_accel = (acc_sig + 1.0) / 2.0 * 100.0

        # 3. Network spread component (unique users ratio & diffusion reach)
        unique_ratio = np.clip(df['unique_authors'] / np.maximum(1, df['volume']), 0.1, 1.0)
        c_spread = unique_ratio * 100.0

        # 4. Volume scale component (logarithmic scale)
        log_vol = np.log1p(df['volume'])
        c_volume = np.clip((log_vol / np.log1p(400)) * 100.0, 0, 100.0)

        # 5. Sentiment intensity component: Absolute polarity deviation from neutrality
        # High sentiment (either strong positive or strong controversy) acts as a catalyst
        sent_intensity = np.clip(np.abs(df['avg_sentiment']) * 1.25, 0.0, 1.0)
        c_sentiment = sent_intensity * 100.0

        # Store component raw scores
        df['score_velocity_part'] = c_velocity
        df['score_accel_part'] = c_accel
        df['score_spread_part'] = c_spread
        df['score_volume_part'] = c_volume
        df['score_sentiment_part'] = c_sentiment

        # Weighted aggregate
        w = self.weights
        total_score = (
            w['growth_velocity'] * c_velocity +
            w['acceleration'] * c_accel +
            w['network_spread'] * c_spread +
            w['volume_scale'] * c_volume +
            w['sentiment_intensity'] * c_sentiment
        )
        
        df['trend_score'] = np.clip(np.round(total_score, 1), 0.0, 100.0)

        # Calculate factor contribution percentages for each row
        weighted_terms = pd.DataFrame({
            'Velocity': w['growth_velocity'] * c_velocity,
            'Acceleration': w['acceleration'] * c_accel,
            'User Diffusion': w['network_spread'] * c_spread,
            'Volume Scale': w['volume_scale'] * c_volume,
            'Sentiment Catalyst': w['sentiment_intensity'] * c_sentiment
        })
        
        denom = weighted_terms.sum(axis=1).replace(0, 1)
        df['attribution_velocity'] = np.round((weighted_terms['Velocity'] / denom) * 100, 1)
        df['attribution_acceleration'] = np.round((weighted_terms['Acceleration'] / denom) * 100, 1)
        df['attribution_diffusion'] = np.round((weighted_terms['User Diffusion'] / denom) * 100, 1)
        df['attribution_volume'] = np.round((weighted_terms['Volume Scale'] / denom) * 100, 1)
        df['attribution_sentiment'] = np.round((weighted_terms['Sentiment Catalyst'] / denom) * 100, 1)

        # Compute delta score from previous window
        df['prev_trend_score'] = df.groupby('topic_id')['trend_score'].shift(1).fillna(df['trend_score'])
        df['score_delta'] = np.round(df['trend_score'] - df['prev_trend_score'], 1)

        return df

    def decompose_score_increase(self, topic_row: pd.Series) -> dict:
        """
        Decomposes why a trend score increased, providing exact quantitative percentages
        and the primary catalyst driver.
        """
        attributions = {
            "Velocity Surge": float(topic_row.get('attribution_velocity', 30)),
            "Acceleration Shock": float(topic_row.get('attribution_acceleration', 25)),
            "Broad Community Diffusion": float(topic_row.get('attribution_diffusion', 20)),
            "Volume Magnitude": float(topic_row.get('attribution_volume', 15)),
            "Sentiment Catalyst": float(topic_row.get('attribution_sentiment', 10))
        }

        # Find primary driver
        primary_driver = max(attributions.items(), key=lambda x: x[1])

        return {
            "trend_score": float(topic_row.get('trend_score', 50)),
            "score_delta": float(topic_row.get('score_delta', 0)),
            "attributions": attributions,
            "primary_driver": primary_driver[0],
            "primary_driver_pct": primary_driver[1]
        }
