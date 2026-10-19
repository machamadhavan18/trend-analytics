import random
import math
from datetime import datetime, timedelta

# Seed for reproducibility with controlled variance
random.seed(42)

TOPIC_SEEDS = [
    {
        "id": "generative_ai",
        "name": "#GenerativeAI",
        "category": "Artificial Intelligence",
        "keywords": ["llm", "diffusion", "reasoning", "multimodal", "transformer", "prompting", "gpt", "gemini", "agentic", "inference"],
        "base_volume": 420,
        "growth_profile": "exponential", # Rapid surge
        "sentiment_profile": (0.65, 0.15), # (mean, std)
        "network_density": 0.08
    },
    {
        "id": "quantum_sensing",
        "name": "#QuantumSensing",
        "category": "Deep Tech",
        "keywords": ["quantum", "sensors", "magnetometer", "qubit", "photonics", "precision", "metrology", "cryogenic"],
        "base_volume": 110,
        "growth_profile": "emerging", # High acceleration from small base
        "sentiment_profile": (0.75, 0.10),
        "network_density": 0.05
    },
    {
        "id": "autonomous_evs",
        "name": "#AutonomousVehicles",
        "category": "Mobility & Robotics",
        "keywords": ["robotaxi", "lidar", "autonomous", "fused_vision", "waymo", "electric", "battery", "sensors"],
        "base_volume": 260,
        "growth_profile": "fluctuating", # Volatile spikes
        "sentiment_profile": (0.35, 0.30),
        "network_density": 0.06
    },
    {
        "id": "green_tech",
        "name": "#GreenHydrogen",
        "category": "Clean Energy",
        "keywords": ["hydrogen", "electrolysis", "cleanenergy", "zeroemission", "solar", "renewable", "grid", "storage"],
        "base_volume": 180,
        "growth_profile": "linear_growth", # Steady rise
        "sentiment_profile": (0.80, 0.12),
        "network_density": 0.04
    },
    {
        "id": "cyber_resilience",
        "name": "#ZeroTrustSecurity",
        "category": "Cybersecurity",
        "keywords": ["zerotrust", "ransomware", "encryption", "infosec", "endpoint", "vulnerability", "auth", "phishing"],
        "base_volume": 310,
        "growth_profile": "stable", # Low volatility, steady baseline
        "sentiment_profile": (-0.15, 0.25),
        "network_density": 0.05
    },
    {
        "id": "metaverse_hype",
        "name": "#SpatialComputing",
        "category": "Virtual Reality",
        "keywords": ["spatial", "ar", "vr", "headset", "metaverse", "vision", "immersive", "virtual"],
        "base_volume": 350,
        "growth_profile": "decaying", # Peaked and currently declining
        "sentiment_profile": (0.10, 0.35),
        "network_density": 0.03
    }
]

INFLUENTIAL_USERS = [
    {"user_id": "u_tech_oracle", "name": "TechOracle", "role": "Key Opinion Leader", "followers": 285000, "hub_tier": "mega"},
    {"user_id": "u_dr_quantum", "name": "DrElenaQuantum", "role": "Senior Physicist", "followers": 92000, "hub_tier": "expert"},
    {"user_id": "u_ai_insider", "name": "AI_Frontier_News", "role": "Aggregator", "followers": 160000, "hub_tier": "broadcaster"},
    {"user_id": "u_clean_future", "name": "GreenGridAdvisor", "role": "Energy Analyst", "followers": 74000, "hub_tier": "expert"},
    {"user_id": "u_sec_sentinel", "name": "SecSentinel", "role": "Threat Hunter", "followers": 115000, "hub_tier": "broadcaster"},
    {"user_id": "u_vc_venture", "name": "HorizonVentures", "role": "Tech Investor", "followers": 195000, "hub_tier": "bridge"},
    {"user_id": "u_dev_echo", "name": "CodeAndCoffee", "role": "Engineer", "followers": 48000, "hub_tier": "community"},
    {"user_id": "u_policy_watch", "name": "DigitalPolicyHub", "role": "Regulatory Thinktank", "followers": 83000, "hub_tier": "bridge"}
]

def add_custom_topic_seed(name: str, category: str = "Technology", keywords: list = None, profile: str = "emerging"):
    """Dynamically registers a new custom topic into the streaming system."""
    clean_id = name.lower().replace('#', '').replace(' ', '_').strip()
    clean_name = f"#{name.replace('#', '').strip()}"
    kws = keywords if keywords and len(keywords) > 0 else ["innovation", "scaling", "ecosystem", "adoption", "breakthrough"]
    
    new_seed = {
        "id": clean_id,
        "name": clean_name,
        "category": category or "Technology",
        "keywords": kws,
        "base_volume": random.randint(150, 350),
        "growth_profile": profile or "emerging",
        "sentiment_profile": (random.uniform(0.2, 0.7), random.uniform(0.1, 0.25)),
        "network_density": random.uniform(0.04, 0.08)
    }

    # Avoid duplicate
    existing = [t for t in TOPIC_SEEDS if t['id'] == clean_id]
    if not existing:
        TOPIC_SEEDS.append(new_seed)
    return new_seed

def generate_social_media_stream(num_windows=24, topic_list=None):
    """
    Generates time-stamped social media posts across sliding observation windows.
    Each post contains content text, user relations (for diffusion cascades),
    sentiment, engagement metrics, and timestamps.
    """
    records = []
    base_time = datetime.now() - timedelta(hours=num_windows)
    topics = topic_list if topic_list else TOPIC_SEEDS

    # Standard non-influencer users
    community_users = [f"user_{i:03d}" for i in range(1, 140)]

    for window_idx in range(num_windows):
        window_start = base_time + timedelta(hours=window_idx)

        for topic in topics:
            profile = topic.get("growth_profile", "linear_growth")
            if profile == "exponential":
                growth_factor = 1.0 + (window_idx / max(1, num_windows)) ** 2.2 * 3.5
            elif profile == "emerging":
                if window_idx > num_windows - 7:
                    growth_factor = 1.0 + ((window_idx - max(0, num_windows - 7)) ** 1.8) * 1.5
                else:
                    growth_factor = 0.7 + (window_idx / max(1, num_windows)) * 0.4
            elif profile == "fluctuating":
                spike = 2.5 if window_idx in [num_windows - 5, num_windows - 2] else 1.0
                growth_factor = (1.0 + 0.5 * math.sin(window_idx * 0.8)) * spike
            elif profile == "linear_growth":
                growth_factor = 1.0 + (window_idx / max(1, num_windows)) * 1.2
            elif profile == "stable":
                growth_factor = 1.0 + random.uniform(-0.15, 0.15)
            elif profile == "decaying":
                growth_factor = max(0.25, 2.0 - (window_idx / max(1, num_windows)) * 1.6 + random.uniform(-0.1, 0.1))
            else:
                growth_factor = 1.0

            vol = int(topic["base_volume"] * 0.25 * growth_factor * random.uniform(0.85, 1.15))
            vol = max(10, vol)

            topic_keywords = topic["keywords"]
            mean_sent, std_sent = topic.get("sentiment_profile", (0.5, 0.2))

            relevant_influencers = [u for u in INFLUENTIAL_USERS if random.random() < 0.35 or u["user_id"] == "u_tech_oracle"]

            window_posts = []
            for p_idx in range(vol):
                post_time = window_start + timedelta(minutes=random.randint(0, 59), seconds=random.randint(0, 59))
                
                if relevant_influencers and random.random() < 0.18:
                    author = random.choice(relevant_influencers)
                    author_id = author["user_id"]
                    author_name = author["name"]
                    followers = author["followers"]
                else:
                    author_id = random.choice(community_users)
                    author_name = author_id
                    followers = random.randint(120, 4500)

                selected_kw = random.sample(topic_keywords, min(len(topic_keywords), random.randint(2, 4)))
                hashtag_str = topic["name"]
                
                text_templates = [
                    f"Exciting breakthroughs in {hashtag_str}! The latest {selected_kw[0]} benchmarks show massive leaps in {selected_kw[1]}. Truly transformative.",
                    f"Evaluating practical trade-offs in {hashtag_str}: while {selected_kw[0]} is promising, scaling {selected_kw[1]} still demands careful engineering.",
                    f"New report released on {hashtag_str}: how {selected_kw[0]} and {selected_kw[1]} are reshaping industry adoption this quarter.",
                    f"Critical debate surrounding {hashtag_str}. Can {selected_kw[0]} overcome latency limits compared with traditional {selected_kw[1]} frameworks?",
                    f"Just deployed a new pipeline utilizing {selected_kw[0]} for {hashtag_str}. The gain in {selected_kw[1]} efficiency is remarkable.",
                    f"Why everyone is watching {hashtag_str} right now: key developments in {selected_kw[0]} could shift market dynamics over the coming weeks."
                ]
                text = random.choice(text_templates)
                sentiment = min(1.0, max(-1.0, random.gauss(mean_sent, std_sent)))

                retweet_of_id = None
                retweet_of_user = None
                is_retweet = False

                if window_posts and random.random() < 0.45:
                    parent_post = random.choice(window_posts)
                    retweet_of_id = parent_post["post_id"]
                    retweet_of_user = parent_post["author_id"]
                    is_retweet = True
                elif relevant_influencers and random.random() < 0.25:
                    target_inf = random.choice(relevant_influencers)
                    retweet_of_user = target_inf["user_id"]
                    is_retweet = True

                post_id = f"p_{topic['id']}_{window_idx}_{p_idx}"
                likes = int(random.lognormvariate(2.5, 1.2) * (5 if "oracle" in author_id or "news" in author_id else 1))
                retweets = int(likes * random.uniform(0.15, 0.45))

                post_record = {
                    "post_id": post_id,
                    "window_index": window_idx,
                    "timestamp": post_time.isoformat(),
                    "topic_id": topic["id"],
                    "topic_name": topic["name"],
                    "category": topic["category"],
                    "author_id": author_id,
                    "author_name": author_name,
                    "author_followers": followers,
                    "text": text,
                    "sentiment": round(sentiment, 3),
                    "likes": likes,
                    "retweets": retweets,
                    "is_retweet": is_retweet,
                    "retweet_of_id": retweet_of_id,
                    "retweet_of_user": retweet_of_user,
                    "hashtags": [topic["name"], f"#{selected_kw[0]}", f"#{selected_kw[1]}"]
                }
                window_posts.append(post_record)
                records.append(post_record)

    return records
