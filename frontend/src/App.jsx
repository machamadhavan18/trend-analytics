import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import MetricCards from './components/MetricCards';
import TopicSelector from './components/TopicSelector';
import AIInsightPanel from './components/AIInsightPanel';
import TrendTrajectoryChart from './components/TrendTrajectoryChart';
import PredictionChart from './components/PredictionChart';
import DiffusionNetworkView from './components/DiffusionNetworkView';
import TopicComparator from './components/TopicComparator';
import AlertsDrawer from './components/AlertsDrawer';
import EvaluationModal from './components/EvaluationModal';
import UploadModal from './components/UploadModal';
import LivePostFeed from './components/LivePostFeed';
import FeatureImportanceChart from './components/FeatureImportanceChart';
import SIRSimulationChart from './components/SIRSimulationChart';
import EventInjectionModal from './components/EventInjectionModal';
import TopicContentExplorer from './components/TopicContentExplorer';
import AddTopicModal from './components/AddTopicModal';
import GlobalSearchModal from './components/GlobalSearchModal';
import ModelStudioModal from './components/ModelStudioModal';
import TimeLapsePlayer from './components/TimeLapsePlayer';

import { Sparkles, GitCompare, Network, Bell, Radio, Zap } from 'lucide-react';

export default function App() {
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [topicDetail, setTopicDetail] = useState(null);
  const [insightData, setInsightData] = useState(null);
  const [networkData, setNetworkData] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [currentWindow, setCurrentWindow] = useState(16);
  const [activeWindow, setActiveWindow] = useState(15);

  const [activeTab, setActiveTab] = useState('insights'); // 'insights' | 'network' | 'feed' | 'comparison' | 'alerts'
  const [isStreaming, setIsStreaming] = useState(false);
  const [isEvaluationOpen, setIsEvaluationOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEventInjectionOpen, setIsEventInjectionOpen] = useState(false);
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isModelStudioOpen, setIsModelStudioOpen] = useState(false);

  const streamTimerRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedTopicId) {
      fetchTopicData(selectedTopicId);
    }
  }, [selectedTopicId]);

  useEffect(() => {
    if (isStreaming) {
      streamTimerRef.current = setInterval(() => {
        handleStepSimulation();
      }, 5000);
    } else {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    }
    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    };
  }, [isStreaming, selectedTopicId]);

  const fetchInitialData = async () => {
    try {
      const [resTopics, resAlerts, resEval] = await Promise.all([
        fetch('/api/topics').then(r => r.json()),
        fetch('/api/alerts').then(r => r.json()),
        fetch('/api/evaluation').then(r => r.json())
      ]);

      if (resTopics && resTopics.topics) {
        setTopics(resTopics.topics);
        setCurrentWindow(resTopics.current_window);
        setActiveWindow(resTopics.current_window - 1);
        const initialId = resTopics.topics[0]?.topic_id;
        setSelectedTopicId(initialId);
      }
      if (resAlerts && resAlerts.alerts) {
        setAlerts(resAlerts.alerts);
      }
      if (resEval) {
        setEvaluation(resEval);
      }
    } catch (err) {
      console.error("Error loading initial analytics data:", err);
    }
  };

  const fetchTopicData = async (topicId) => {
    try {
      const [resDetail, resInsight, resNet, resPred] = await Promise.all([
        fetch(`/api/topic/${topicId}`).then(r => r.json()),
        fetch(`/api/insights/${topicId}`).then(r => r.json()),
        fetch(`/api/network/${topicId}`).then(r => r.json()),
        fetch(`/api/prediction/${topicId}`).then(r => r.json())
      ]);

      setTopicDetail(resDetail);
      setInsightData(resInsight);
      setNetworkData(resNet);
      setPredictionData(resPred.prediction);
    } catch (err) {
      console.error(`Error fetching data for topic ${topicId}:`, err);
    }
  };

  const handleStepSimulation = async () => {
    try {
      const res = await fetch('/api/simulate/step', { method: 'POST' });
      const data = await res.json();
      setCurrentWindow(data.current_window);
      setActiveWindow(data.current_window - 1);

      const resTopics = await fetch('/api/topics').then(r => r.json());
      const resAlerts = await fetch('/api/alerts').then(r => r.json());
      setTopics(resTopics.topics);
      setAlerts(resAlerts.alerts);

      if (selectedTopicId) {
        fetchTopicData(selectedTopicId);
      }
    } catch (err) {
      console.error("Error advancing simulation step:", err);
    }
  };

  const handleResetSimulation = async () => {
    try {
      await fetch('/api/simulate/reset', { method: 'POST' });
      setIsStreaming(false);
      fetchInitialData();
    } catch (err) {
      console.error("Error resetting simulation:", err);
    }
  };

  const handleWeightsUpdated = (data) => {
    if (data.topics) {
      setTopics(data.topics);
    }
    if (selectedTopicId) {
      fetchTopicData(selectedTopicId);
    }
  };

  const handleSelectTopicFromSearch = (topicId) => {
    setSelectedTopicId(topicId);
    setActiveTab('insights');
  };

  const selectedTopic = topics.find(t => t.topic_id === selectedTopicId) || topics[0];

  return (
    <div className="app-container">
      {/* Top Navigation & Simulation Control Bar */}
      <Header
        isStreaming={isStreaming}
        toggleStreaming={() => setIsStreaming(!isStreaming)}
        onStepSimulation={handleStepSimulation}
        onResetSimulation={handleResetSimulation}
        onOpenEvaluation={() => setIsEvaluationOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenEventInjection={() => setIsEventInjectionOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenModelStudio={() => setIsModelStudioOpen(true)}
        alertCount={alerts.length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Navigation Tabs */}
      <nav className="nav-tabs">
        <button
          className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          <Sparkles size={16} />
          AI Trend Insights & Forecasting
        </button>

        <button
          className={`tab-btn ${activeTab === 'network' ? 'active' : ''}`}
          onClick={() => setActiveTab('network')}
        >
          <Network size={16} />
          Diffusion Network & SIR Epidemics
        </button>

        <button
          className={`tab-btn ${activeTab === 'feed' ? 'active' : ''}`}
          onClick={() => setActiveTab('feed')}
        >
          <Radio size={16} />
          Live Stream Post Feed
        </button>

        <button
          className={`tab-btn ${activeTab === 'comparison' ? 'active' : ''}`}
          onClick={() => setActiveTab('comparison')}
        >
          <GitCompare size={16} />
          Topic Comparison
        </button>

        <button
          className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          <Bell size={16} />
          Real-Time Alerts
          {alerts.length > 0 && (
            <span className="tab-badge highlight">{alerts.length}</span>
          )}
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="main-layout">
        {/* Interactive 24-Hour Time-Lapse Scrubber & Replay Studio */}
        <TimeLapsePlayer
          currentWindow={currentWindow}
          activeWindow={activeWindow}
          onSelectWindow={(win) => setActiveWindow(win)}
          onJumpToLive={() => setActiveWindow(currentWindow - 1)}
        />

        {/* KPI Metric Summary Cards */}
        <MetricCards
          topics={topics}
          alerts={alerts}
          evaluation={evaluation}
          currentWindow={activeWindow + 1}
        />

        {/* Tab 1: AI Trend Insights & Forecasting */}
        {activeTab === 'insights' && (
          <div className="dashboard-grid">
            {/* Left Sidebar: Detected Topics */}
            <TopicSelector
              topics={topics}
              selectedTopicId={selectedTopicId}
              onSelectTopic={(id) => setSelectedTopicId(id)}
              onOpenAddTopic={() => setIsAddTopicOpen(true)}
            />

            {/* Right Pane: AI Insights & Core Charts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Module 6: AI Trend Insight Generator Spotlight */}
              <AIInsightPanel
                topic={selectedTopic}
                insightData={insightData}
              />

              {/* Topic Content & Entity Explorer */}
              <TopicContentExplorer
                topic={selectedTopic}
                topicDetail={topicDetail}
                onExploreLivePosts={() => setActiveTab('feed')}
              />

              {/* Main Charts Grid */}
              <div className="charts-grid">
                {/* Modules 3 & 4: Sliding Window Volume & Velocity */}
                <TrendTrajectoryChart
                  history={topicDetail?.history}
                  topicName={selectedTopic?.topic_name || ''}
                />

                {/* Modules 5 & 6: XGBoost Popularity Prediction vs Moving Average */}
                <PredictionChart
                  predictionData={predictionData}
                  topicName={selectedTopic?.topic_name || ''}
                />
              </div>

              {/* XAI: Feature Importance Chart */}
              <FeatureImportanceChart
                featureImportances={predictionData?.feature_importances}
                r2Score={predictionData?.r2_score}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Diffusion Network & SIR Epidemic Cascade */}
        {activeTab === 'network' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>Focus Topic:</span>
              <select
                className="custom-select"
                value={selectedTopicId || ''}
                onChange={(e) => setSelectedTopicId(e.target.value)}
              >
                {topics.map(t => (
                  <option key={t.topic_id} value={t.topic_id}>{t.topic_name}</option>
                ))}
              </select>
            </div>

            {/* NetworkX Diffusion Graph & Centralities */}
            <DiffusionNetworkView
              networkData={networkData}
              topicName={selectedTopic?.topic_name || ''}
            />

            {/* SIR Epidemiological Cascade Model */}
            <SIRSimulationChart
              sirData={networkData?.sir_simulation}
              summaryData={networkData?.summary}
              topicName={selectedTopic?.topic_name || ''}
            />
          </div>
        )}

        {/* Tab 3: Live Stream Post Feed */}
        {activeTab === 'feed' && (
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
            <TopicSelector
              topics={topics}
              selectedTopicId={selectedTopicId}
              onSelectTopic={(id) => setSelectedTopicId(id)}
            />
            <LivePostFeed
              selectedTopicId={selectedTopicId}
              topicName={selectedTopic?.topic_name}
            />
          </div>
        )}

        {/* Tab 4: Topic Comparison */}
        {activeTab === 'comparison' && (
          <TopicComparator topics={topics} />
        )}

        {/* Tab 5: Real-Time Threshold Alerts */}
        {activeTab === 'alerts' && (
          <AlertsDrawer alerts={alerts} />
        )}
      </main>

      {/* Performance Evaluation Benchmarks Modal (Module 12) */}
      <EvaluationModal
        isOpen={isEvaluationOpen}
        onClose={() => setIsEvaluationOpen(false)}
        evaluationData={evaluation}
      />

      {/* Upload Custom Dataset Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={fetchInitialData}
      />

      {/* Event Injection Shock Simulator Modal */}
      <EventInjectionModal
        isOpen={isEventInjectionOpen}
        onClose={() => setIsEventInjectionOpen(false)}
        topics={topics}
        onEventInjected={fetchInitialData}
      />

      {/* Add & Analyze Custom Topic Modal */}
      <AddTopicModal
        isOpen={isAddTopicOpen}
        onClose={() => setIsAddTopicOpen(false)}
        onTopicCreated={(newId) => {
          fetchInitialData();
          if (newId) setSelectedTopicId(newId);
        }}
      />

      {/* Global Content Discovery & Semantic Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTopic={handleSelectTopicFromSearch}
      />

      {/* Interactive Model Tuning & Scoring Weight Studio Modal */}
      <ModelStudioModal
        isOpen={isModelStudioOpen}
        onClose={() => setIsModelStudioOpen(false)}
        onWeightsUpdated={handleWeightsUpdated}
      />
    </div>
  );
}
