import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';

const Node = React.memo(({ node, jsPlumb, id, setNodes, currentTranscript, handleUrlSubmit }) => {
  const nodeRef = useRef(null);
  const [localData, setLocalData] = useState(node.data);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (nodeRef.current && jsPlumb) {
      jsPlumb.manage(nodeRef.current);
      
      if (node.type === 'url') {
        jsPlumb.addEndpoint(nodeRef.current, {
          id: id,
          anchor: "Bottom",
          isSource: true,
          isTarget: false,
          connector: ["Bezier", { curviness: 60 }],
          maxConnections: -1,
          endpoint: ["Dot", { radius: 6 }],
          paintStyle: { 
            fill: "#4CAF50",
            stroke: '#fff',
            strokeWidth: 2
          },
          hoverPaintStyle: { 
            fill: "#45a049",
            stroke: '#fff',
            strokeWidth: 3
          },
          data: id
        });
      }

      if (node.type === 'chat') {
        jsPlumb.addEndpoint(nodeRef.current, {
          id: id,
          anchor: "Top",
          isSource: false,
          isTarget: true,
          maxConnections: -1,
          endpoint: ["Dot", { radius: 6 }],
          paintStyle: { 
            fill: "#4CAF50",
            stroke: '#fff',
            strokeWidth: 2
          },
          hoverPaintStyle: { 
            fill: "#45a049",
            stroke: '#fff',
            strokeWidth: 3
          },
          data: id
        });
      }

      jsPlumb.setDraggable(nodeRef.current, true);
    }


    setLocalData(prev => ({
      ...prev,
      messages: []
    }));

    return () => {
      if (jsPlumb && nodeRef.current) {
        jsPlumb.removeAllEndpoints(nodeRef.current);
        jsPlumb.unmanage(nodeRef.current);
      }
    };
  }, [jsPlumb, node.type, id]);

  const handleQuestionSubmit = async () => {
    if (!localData.input.trim()) return;
    setLoading(true)
    console.log('transcript', JSON.stringify({
        question: localData.input,
        transcript: localStorage.getItem('transcript')
      }))
    try {
      const response = await fetch('http://localhost:8000/ask-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: localData.input,
          transcript: localStorage.getItem('transcript')
        })
      });

      const data = await response.json();
      console.log('data', data)
      setLocalData(prev => ({
        ...prev,
        messages: [...prev.messages, 
          { text: localData.input, isUser: true },
          { text: data.answer, isUser: false }
        ],
        input: ''
      }));
    } catch (error) {
      console.error('Error asking question:', error);
    }
    setLoading(false)
  };

  return (
    <div
      ref={nodeRef}
      data-key={node.id}
      className={`node ${node.type}-node ${node.data.connectedUrl ? 'connected' : ''} ${isHovered ? 'hovered' : ''}`}
      style={{
        left: node.position.x,
        top: node.position.y
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="node-header">
        {node.type === 'url' ? '🔗 URL Node' : '💬 Chat Node'}
      </div>
      {node.type === 'url' ? (
        <div className="url-content">
          <input
            type="text"
            
            placeholder="Enter YouTube URL"
            value={localData.url}
            onChange={(e) => {
              setLocalData({ ...localData, url: e.target.value });
              setNodes(prev => prev.map(n => 
                n.id === node.id 
                  ? { ...n, data: { ...n.data, url: e.target.value }} 
                  : n
              ));
            }}
          />
          {node.data.status === 'processing' && (
            <div className="loading-indicator">
              <div className="loading-spinner"></div>
              <span>Processing video...</span>
            </div>
          )}
        </div>
      ) : (
        <div className="chat-content">
          <div className="chat-messages">
            {localData.messages.map((msg, i) => (
              <div key={i} className={`message ${msg.isUser ? 'user' : 'bot'}`}>
                <span className="message-icon">
                  {msg.isUser ? '👤' : '🤖'}
                </span>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chat-input-container">
            <input
              type="text"
              placeholder="Ask about video..."
              value={localData.input}
              onChange={(e) => setLocalData({ ...localData, input: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleQuestionSubmit()}
            />
            <button onClick={handleQuestionSubmit}>
              <span className="button-icon">↗️</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default Node;