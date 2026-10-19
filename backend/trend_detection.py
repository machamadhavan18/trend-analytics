import pandas as pd
import numpy as np

class TrendDetector:
    """
    Module 3: Trend detection (Sliding Window Analysis)
    Applies sliding temporal windows to track volume momentum, velocity,
    acceleration, and anomaly z-scores across consecutive observation intervals.
    """
    def __init__(self, window_count=24):
        self.window_count = window_count

    def analyze_sliding_windows(self, df_aggregated: pd.DataFrame) -> pd.DataFrame:
        """
        Takes aggregated (topic_id, window_index) DataFrame and computes:
        - Velocity (1st discrete derivative: delta volume)
        - Acceleration (2nd discrete derivative: rate of change of velocity)
        - Relative Growth Rate %
        - Rolling 4-window moving baseline
        - Z-score of volume spike
        - Trend State classification
        """
        if df_aggregated.empty:
            return df_aggregated

        df = df_aggregated.sort_values(by=['topic_id', 'window_index']).copy()

        # Compute lag features per topic
        df['prev_volume'] = df.groupby('topic_id')['volume'].shift(1).fillna(df['volume'])
        df['prev_prev_volume'] = df.groupby('topic_id')['volume'].shift(2).fillna(df['prev_volume'])

        # Velocity = V(t) - V(t-1)
        df['velocity'] = df['volume'] - df['prev_volume']
        df['prev_velocity'] = df.groupby('topic_id')['velocity'].shift(1).fillna(0)

        # Acceleration = Velocity(t) - Velocity(t-1)
        df['acceleration'] = df['velocity'] - df['prev_velocity']

        # Relative Growth Rate = (V_t - V_{t-1}) / V_{t-1}
        df['relative_growth'] = np.where(
            df['prev_volume'] > 0,
            (df['volume'] - df['prev_volume']) / df['prev_volume'],
            0.0
        )

        # Rolling baseline (window of 4)
        df['rolling_mean_vol'] = df.groupby('topic_id')['volume'].transform(
            lambda s: s.rolling(window=4, min_periods=1).mean()
        )
        df['rolling_std_vol'] = df.groupby('topic_id')['volume'].transform(
            lambda s: s.rolling(window=4, min_periods=1).std().fillna(1.0)
        )

        # Z-score: (Volume - RollingMean) / RollingStd
        df['volume_zscore'] = np.where(
            df['rolling_std_vol'] > 0.001,
            (df['volume'] - df['rolling_mean_vol']) / df['rolling_std_vol'],
            0.0
        )

        # Classify dynamic state
        def classify_state(row):
            rel_g = row['relative_growth']
            acc = row['acceleration']
            z = row['volume_zscore']
            
            if rel_g > 0.40 and acc > 0:
                return "Surging"
            elif rel_g > 0.15 and acc >= 0:
                return "Emerging"
            elif rel_g < -0.20:
                return "Decaying"
            elif abs(acc) > 15:
                return "Volatile"
            else:
                return "Steady"

        df['trend_state'] = df.apply(classify_state, axis=1)

        return df

    def get_latest_window_comparison(self, df_analyzed: pd.DataFrame) -> list:
        """
        Extracts comparison between the latest window and its immediate previous window
        for each topic.
        """
        if df_analyzed.empty:
            return []

        latest_window = df_analyzed['window_index'].max()
        records = []

        for topic_id, group in df_analyzed.groupby('topic_id'):
            latest_row = group[group['window_index'] == latest_window]
            if latest_row.empty:
                latest_row = group.iloc[[-1]]
            
            row = latest_row.iloc[0]
            records.append({
                "topic_id": topic_id,
                "topic_name": row['topic_name'],
                "window_index": int(row['window_index']),
                "current_volume": int(row['volume']),
                "previous_volume": int(row['prev_volume']),
                "velocity": int(row['velocity']),
                "acceleration": int(row['acceleration']),
                "relative_growth_pct": round(float(row['relative_growth']) * 100, 2),
                "volume_zscore": round(float(row['volume_zscore']), 2),
                "trend_state": row['trend_state'],
                "avg_sentiment": round(float(row['avg_sentiment']), 3),
                "unique_authors": int(row['unique_authors']),
                "total_engagement": int(row['total_engagement'])
            })

        return sorted(records, key=lambda x: x['relative_growth_pct'], reverse=True)
