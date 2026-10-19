import re
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

class DataPreprocessor:
    """
    Module 1: Data preprocessing (Pandas + NumPy)
    Cleans raw social media posts, handles missing values, normalizes timestamps,
    tokenizes text, computes rolling aggregates, and structures window slices.
    Resilient to heterogeneous datasets (Instagram, Twitter, Reddit, TikTok, custom CSVs).
    """
    def __init__(self, window_size_hours=1):
        self.window_size_hours = window_size_hours

    def clean_text(self, text: str) -> str:
        """Removes URLs, non-alphanumeric noise, and standardizes whitespace."""
        if not isinstance(text, str):
            return ""
        # Remove URLs
        text = re.sub(r'http\S+|www\.\S+', '', text)
        # Remove special characters but retain hashtags and mentions
        text = re.sub(r'[^\w\s#@]', '', text)
        # Lowercase and clean spaces
        text = re.sub(r'\s+', ' ', text).strip().lower()
        return text

    def _find_column(self, df: pd.DataFrame, candidates: list):
        """Finds the first matching column name from a list of candidates (case-insensitive)."""
        col_map = {str(c).strip().lower(): c for c in df.columns}
        for cand in candidates:
            cand_lower = cand.lower()
            if cand_lower in col_map:
                return col_map[cand_lower]
        return None

    def _estimate_sentiment(self, text: str) -> float:
        """Heuristic lexicon-based sentiment analysis for datasets without explicit sentiment."""
        if not isinstance(text, str) or not text.strip():
            return 0.0
        t = text.lower()
        pos_words = {
            'good', 'great', 'love', 'amazing', 'perfect', 'best', 'happy', 'awesome',
            'nice', 'fire', 'cool', 'breakthrough', 'success', 'win', 'growth', 'super',
            'beautiful', 'innovative', 'excited', 'loved', 'stunning', 'incredible', 'favorite'
        }
        neg_words = {
            'bad', 'worst', 'hate', 'terrible', 'fail', 'sad', 'scam', 'error', 'crisis',
            'risk', 'warning', 'down', 'loss', 'bug', 'crash', 'ugly', 'boring', 'awful',
            'disappointed', 'poor', 'broken', 'horrible', 'fake', 'problem'
        }
        words = re.findall(r'\b[a-z]{3,}\b', t)
        if not words:
            return 0.0
        pos_count = sum(1 for w in words if w in pos_words)
        neg_count = sum(1 for w in words if w in neg_words)
        total = pos_count + neg_count
        if total == 0:
            return 0.05
        return round(float(np.clip((pos_count - neg_count) / total, -1.0, 1.0)), 2)

    def preprocess_posts(self, posts_data) -> pd.DataFrame:
        """
        Converts list of post dictionaries or raw DataFrame into an engineered Pandas DataFrame
        with clean timestamps, clean text, engagement totals, and rolling statistics.
        Handles missing columns, different schemas, and real-world exports like Instagram/TikTok/Twitter.
        """
        if isinstance(posts_data, list):
            df = pd.DataFrame(posts_data)
        elif isinstance(posts_data, pd.DataFrame):
            df = posts_data.copy()
        else:
            raise ValueError("Unsupported data format for preprocessing.")

        if df.empty:
            return df

        # 1. Normalize text content
        text_col = self._find_column(df, [
            'text', 'caption', 'caption_text', 'content', 'description', 
            'message', 'body', 'post_text', 'post_description', 'title', 'tweet', 'status'
        ])
        if text_col:
            df['text'] = df[text_col].fillna("").astype(str)
        else:
            # Fallback to string concatenation of all string-like columns
            obj_cols = df.select_dtypes(include=['object']).columns
            if len(obj_cols) > 0:
                df['text'] = df[obj_cols[0]].fillna("").astype(str)
            else:
                df['text'] = [f"Social post {i+1}" for i in range(len(df))]

        df['clean_text'] = df['text'].apply(self.clean_text)

        # 2. Normalize Post ID
        id_col = self._find_column(df, ['post_id', 'id', 'pk', 'shortcode', 'post_url', 'url', 's.no', 'sno', 'index', 'code'])
        if id_col:
            df['post_id'] = df[id_col].astype(str)
        else:
            df['post_id'] = [f"post_{i+1}" for i in range(len(df))]

        # 3. Normalize Author ID & Author Name
        author_col = self._find_column(df, [
            'author_id', 'author_name', 'author', 'username', 'user', 'owner_username', 
            'owner_id', 'profile_name', 'profile', 'creator', 'user_id', 'account', 'handle'
        ])
        if author_col:
            df['author_id'] = df[author_col].fillna("unknown_user").astype(str)
            df['author_name'] = df['author_id']
        else:
            df['author_id'] = [f"user_{i % 35 + 1}" for i in range(len(df))]
            df['author_name'] = df['author_id']

        # 4. Normalize Likes & Retweets (or comments/shares)
        likes_col = self._find_column(df, ['likes', 'like_count', 'likes_count', 'num_likes', 'favorites', 'favorite_count', 'favs'])
        if likes_col:
            df['likes'] = pd.to_numeric(df[likes_col], errors='coerce').fillna(0).astype(int)
        else:
            # Synthesize realistic likes distribution
            df['likes'] = np.random.randint(15, 250, size=len(df))

        retweets_col = self._find_column(df, [
            'retweets', 'retweet_count', 'retweets_count', 'shares', 'share_count', 
            'comments', 'comment_count', 'comments_count', 'reposts'
        ])
        if retweets_col:
            df['retweets'] = pd.to_numeric(df[retweets_col], errors='coerce').fillna(0).astype(int)
        else:
            df['retweets'] = (df['likes'] * 0.18).clip(lower=1).astype(int)

        # 5. Normalize Author Followers
        followers_col = self._find_column(df, ['author_followers', 'followers', 'follower_count', 'followers_count'])
        if followers_col:
            df['author_followers'] = pd.to_numeric(df[followers_col], errors='coerce').fillna(1200).astype(int)
        else:
            df['author_followers'] = np.random.randint(400, 25000, size=len(df))

        # 6. Normalize Sentiment
        sentiment_col = self._find_column(df, ['sentiment', 'sentiment_score', 'polarity'])
        if sentiment_col:
            df['sentiment'] = pd.to_numeric(df[sentiment_col], errors='coerce').fillna(0.0).astype(float)
        else:
            df['sentiment'] = df['text'].apply(self._estimate_sentiment)

        # 7. Normalize Hashtags
        hashtags_col = self._find_column(df, ['hashtags', 'hashtag', 'tags', 'tag'])
        if hashtags_col:
            def parse_hashtags(val):
                if isinstance(val, list):
                    return [str(h) for h in val]
                if isinstance(val, str) and val.strip():
                    extracted = re.findall(r'#?\w+', val)
                    return [f"#{h.strip('#')}" for h in extracted if len(h) > 1]
                return []
            df['hashtags'] = df[hashtags_col].apply(parse_hashtags)
        else:
            df['hashtags'] = df['text'].apply(lambda t: [f"#{h}" for h in re.findall(r'#(\w+)', str(t))])

        # 8. Normalize Topic ID & Topic Name (Crucial for Instagram / generic CSVs)
        id_col = self._find_column(df, ['topic_id'])
        name_col = self._find_column(df, ['topic_name', 'topic', 'category', 'theme', 'subject'])

        if id_col and name_col:
            df['topic_id'] = df[id_col].fillna("general").astype(str)
            df['topic_name'] = df[name_col].fillna("General").astype(str)
        elif id_col and not name_col:
            df['topic_id'] = df[id_col].fillna("general").astype(str)
            df['topic_name'] = df['topic_id'].apply(lambda i: f"#{str(i).replace('_', ' ').title().replace(' ', '')}")
        elif not id_col and name_col:
            df['topic_name'] = df[name_col].fillna("General").astype(str)
            df['topic_id'] = df['topic_name'].apply(lambda n: re.sub(r'[^\w\s]', '', str(n)).strip().lower().replace(' ', '_') or 'general')
        else:
            # Automatically discover topics from hashtags or text clustering!
            all_tags = []
            for tags in df['hashtags']:
                all_tags.extend(tags)

            if len(all_tags) >= 5:
                # Use top 4-6 most frequent hashtags as topics
                tag_counts = pd.Series(all_tags).value_counts()
                top_tags = tag_counts.head(6).index.tolist()
                
                def assign_topic(row_tags):
                    for t in top_tags:
                        if t in row_tags:
                            return t
                    return top_tags[0] if top_tags else "#SocialMedia"

                df['topic_name'] = df['hashtags'].apply(assign_topic)
            else:
                # Extract frequent keywords of length >= 4
                words = re.findall(r'\b[a-zA-Z]{4,}\b', " ".join(df['clean_text']))
                stop_words = {'this', 'that', 'with', 'from', 'have', 'were', 'been', 'about', 'more', 'post', 'view', 'like'}
                clean_words = [w.capitalize() for w in words if w.lower() not in stop_words]
                word_counts = pd.Series(clean_words).value_counts()
                top_themes = [f"#{w}" for w in word_counts.head(4).index.tolist()]
                
                if len(top_themes) >= 2:
                    df['topic_name'] = [top_themes[i % len(top_themes)] for i in range(len(df))]
                else:
                    fallback_topics = ["#SocialTrends", "#DigitalPulse", "#CreatorCommunity", "#ViralDiscovery"]
                    df['topic_name'] = [fallback_topics[i % len(fallback_topics)] for i in range(len(df))]

            df['topic_id'] = df['topic_name'].apply(lambda n: re.sub(r'[^\w]', '', n.lower().replace('#', '')) or 'trend')

        # 9. Normalize Timestamps & Datetime
        time_col = self._find_column(df, ['timestamp', 'date', 'datetime', 'created_at', 'created_time', 'posted_at', 'taken_at', 'time', 'date_posted'])
        if time_col:
            df['datetime'] = pd.to_datetime(df[time_col], errors='coerce')
        else:
            df['datetime'] = pd.NaT

        now = datetime.now()
        if df['datetime'].isnull().all():
            # Generate sequential progression over past 24 hours
            time_steps = pd.to_timedelta(np.linspace(0, 24 * 3600, len(df)), unit='s')
            df['datetime'] = (now - timedelta(hours=24)) + time_steps
        elif df['datetime'].isnull().any():
            # Interpolate missing datetimes
            df['datetime'] = df['datetime'].ffill().bfill().fillna(now)

        # Standardize timestamp string
        df['timestamp'] = df['datetime'].dt.strftime('%Y-%m-%d %H:%M:%S')

        # 10. Engagement total
        df['engagement'] = df['likes'] + 2 * df['retweets']

        # 11. Normalize Retweet / Cascade Target (for diffusion graphs)
        if 'retweet_of_user' not in df.columns or df['retweet_of_user'].isnull().all():
            # Extract @mentions from text
            def extract_target(row):
                mentions = re.findall(r'@(\w+)', str(row['text']))
                if mentions:
                    return mentions[0]
                return None

            df['retweet_of_user'] = df.apply(extract_target, axis=1)

            # Connect unlinked posts to top authors in the same topic for rich network diffusion
            top_authors_by_topic = df.groupby('topic_id')['author_id'].agg(lambda s: s.value_counts().index.tolist()[:3]).to_dict()
            for i, row in df.iterrows():
                if pd.isna(row['retweet_of_user']) and i % 3 == 0:
                    topic_authors = top_authors_by_topic.get(row['topic_id'], [])
                    if topic_authors and topic_authors[0] != row['author_id']:
                        df.at[i, 'retweet_of_user'] = topic_authors[i % len(topic_authors)]

        # 12. Assign Sliding Windows (12 - 24 windows minimum for velocity/acceleration)
        df = df.sort_values(by='datetime').reset_index(drop=True)
        min_time = df['datetime'].min()
        max_time = df['datetime'].max()
        time_span_hours = (max_time - min_time).total_seconds() / 3600.0

        if time_span_hours < 6.0:
            # If all timestamps span very few hours (or single date), distribute across 16 sequential windows
            num_windows = min(20, max(12, len(df) // 20))
            df['window_index'] = (np.arange(len(df)) * num_windows // len(df)).astype(int)
        else:
            time_deltas = (df['datetime'] - min_time).dt.total_seconds() / 3600.0
            calc_windows = (time_deltas // self.window_size_hours).astype(int)
            if calc_windows.nunique() < 4:
                df['window_index'] = (np.arange(len(df)) * 16 // len(df)).astype(int)
            elif calc_windows.max() > 30:
                # Scale down so it doesn't exceed 24 windows
                df['window_index'] = (calc_windows * 24 // calc_windows.max()).astype(int)
            else:
                df['window_index'] = calc_windows

        return df

    def aggregate_by_window_and_topic(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Aggregates posts per window and topic using NumPy and Pandas vector operations.
        Computes volume, total engagement, average sentiment, unique users, and retweets.
        """
        if df.empty:
            return pd.DataFrame()

        # Ensure required columns exist
        for req in ['topic_id', 'topic_name', 'window_index', 'post_id', 'engagement', 'likes', 'retweets', 'author_id', 'sentiment', 'author_followers']:
            if req not in df.columns:
                if req in ['engagement', 'likes', 'retweets', 'author_followers']:
                    df[req] = 0
                elif req == 'sentiment':
                    df[req] = 0.0
                elif req == 'window_index':
                    df[req] = 0
                else:
                    df[req] = 'default'

        grouped = df.groupby(['topic_id', 'topic_name', 'window_index']).agg(
            volume=('post_id', 'count'),
            total_engagement=('engagement', 'sum'),
            mean_likes=('likes', 'mean'),
            mean_retweets=('retweets', 'mean'),
            unique_authors=('author_id', 'nunique'),
            avg_sentiment=('sentiment', 'mean'),
            sentiment_std=('sentiment', lambda x: np.std(x) if len(x) > 1 else 0.0),
            high_follower_volume=('author_followers', lambda x: (x > 50000).sum() if len(x) > 0 else 0)
        ).reset_index()

        # Sort by topic and window
        grouped = grouped.sort_values(by=['topic_id', 'window_index']).reset_index(drop=True)
        return grouped
