import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatusMsg(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg({ type: 'success', text: data.message });
        setTimeout(() => {
          onUploadSuccess();
          onClose();
        }, 1200);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Upload failed.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network connection failed during upload.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UploadCloud size={20} color="#3b82f6" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              Upload Custom Social Media Dataset
            </h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Supports CSV & JSON from <strong>Instagram</strong>, <strong>Twitter/X</strong>, <strong>TikTok</strong>, <strong>Reddit</strong>, or custom exports. Missing columns (e.g. hashtags, topics, engagement) are automatically discovered and mapped.
        </p>

        <div style={{
          border: '2px dashed var(--border-color)',
          borderRadius: '10px',
          padding: '28px',
          textAlign: 'center',
          background: 'rgba(15, 23, 42, 0.4)',
          marginBottom: '16px'
        }}>
          <input 
            type="file" 
            id="fileInput"
            accept=".csv, .json"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <label htmlFor="fileInput" style={{ cursor: 'pointer' }}>
            <FileText size={36} color="#60a5fa" style={{ margin: '0 auto 8px auto' }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
              {file ? file.name : "Click to select CSV or JSON file"}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              {file ? `${(file.size / 1024).toFixed(1)} KB` : "Drag and drop or browse local storage"}
            </div>
          </label>
        </div>

        {statusMsg && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            color: statusMsg.type === 'success' ? '#34d399' : '#fb7185',
            border: `1px solid ${statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
          }}>
            {statusMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={onClose} 
            style={{ flex: 1, justifyContent: 'center' }}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleUpload}
            disabled={!file || uploading}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            {uploading ? "Ingesting..." : "Ingest & Analyze"}
          </button>
        </div>
      </div>
    </div>
  );
}
