import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';

const Node = React.memo(({ node, jsPlumb, id, nodes, setNodes, currentTranscript, handleUrlSubmit }) => {
  const nodeRef = useRef(null);
  const [localData, setLocalData] = useState(node.data);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize jsPlumb endpoints
  const initializeEndpoints = () => {
    if (nodeRef.current && jsPlumb && !isInitialized) {
      jsPlumb.removeAllEndpoints(nodeRef.current);
      jsPlumb.manage(nodeRef.current);

      if (node.type === 'url') {
        const endpoint = jsPlumb.addEndpoint(nodeRef.current, {
          id: `${id}-endpoint`,
          anchor: ["Bottom", {
            x: 0.5,
            y: 1,
            orientation: [0, 1]
          }],
          isSource: true,
          isTarget: false,
          connector: ["Bezier", { curviness: 60 }],
          maxConnections: -1,
          endpoint: ["Dot", { radius: 6 }],
          paintStyle: {
            fill: "#4CAF50",
            stroke: '#ffffff',
            strokeWidth: 2,
            radius: 6
          },
          hoverPaintStyle: {
            fill: "#45a049",
            stroke: '#ffffff',
            strokeWidth: 3
          },
          data: id,
          visible: true
        });

        if (endpoint) {
          endpoint.setVisible(true, true);
        }
      }

      if (node.type === 'chat') {
        const endpoint = jsPlumb.addEndpoint(nodeRef.current, {
          id: `${id}-endpoint`,
          anchor: "Top",
          isSource: false,
          isTarget: true,
          maxConnections: -1,
          endpoint: ["Dot", { radius: 6 }],
          paintStyle: {
            fill: "#4CAF50",
            stroke: '#ffffff',
            strokeWidth: 2
          },
          hoverPaintStyle: {
            fill: "#45a049",
            stroke: '#ffffff',
            strokeWidth: 3
          },
          data: id
        });
      }

      // Add connection listener
      jsPlumb.bind("connection", (info) => {
        const sourceId = info.sourceId;
        const targetId = info.targetId;
        
        // Find the URL node
        const urlNode = nodes.find(n => n.id === sourceId);
        if (urlNode && urlNode.data.url) {
          // Update the chat node with the source node ID
          setNodes(prevNodes => prevNodes.map(n => 
            n.id === targetId 
              ? { ...n, data: { ...n.data, sourceNodeId: sourceId } }
              : n
          ));

          // Make the API request
          fetch('http://localhost:8000/process-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: urlNode.data.url })
          });
        }
      });

      jsPlumb.setDraggable(nodeRef.current, true);
      jsPlumb.repaintEverything();
      setIsInitialized(true);
    }
  };

  // Main initialization effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (jsPlumb) {
        initializeEndpoints();
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (jsPlumb && nodeRef.current) {
        jsPlumb.removeAllEndpoints(nodeRef.current);
        jsPlumb.unmanage(nodeRef.current);
      }
    };
  }, [jsPlumb]);

  // Repaint effect
  useEffect(() => {
    if (jsPlumb && isInitialized) {
      const repaintTimer = setInterval(() => {
        if (nodeRef.current) {
          jsPlumb.revalidate(nodeRef.current);
          jsPlumb.repaintEverything();
        }
      }, 250);

      return () => clearInterval(repaintTimer);
    }
  }, [jsPlumb, isInitialized]);

  // Force repaint when nodes change
  useEffect(() => {
    if (jsPlumb && isInitialized && nodeRef.current) {
      jsPlumb.revalidate(nodeRef.current);
      jsPlumb.repaintEverything();
    }
  }, [nodes]);

  // Reset messages when node is created
  useEffect(() => {
    setLocalData(prev => ({
      ...prev,
      messages: []
    }));
  }, []);

  const handleQuestionSubmit = async () => {
    if (!localData.input.trim()) return;
    setLoading(true)
    console.log('transcript', JSON.stringify({
      question: localData.input,
    }))
    try {
      const sourceNode = nodes.find(n => n.id === node.data.sourceNodeId)
      const response = await fetch('http://localhost:8000/ask-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: sourceNode.data.url,
          question: localData.input,
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

  const handleDelete = () => {
    if (jsPlumb && nodeRef.current) {
      // Get all connections for this node
      const connections = jsPlumb.getAllConnections().filter(conn => 
        conn.source.getAttribute('data-key') === id || 
        conn.target.getAttribute('data-key') === id
      );
      
      // Delete all connections
      connections.forEach(conn => {
        jsPlumb.deleteConnection(conn);
      });

      // Remove all endpoints
      jsPlumb.removeAllEndpoints(nodeRef.current);
      jsPlumb.unmanage(nodeRef.current);

      // Remove node from state
      setNodes(prevNodes => prevNodes.filter(n => n.id !== id));
    }
  };

  return (
    <div
      ref={nodeRef}
      data-key={node.id}
      className={`node ${node.type}-node ${node.data.connectedUrl ? 'connected' : ''} ${isHovered ? 'hovered' : ''}`}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: '400px'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="node-header">
        <span>{node.type === 'url' ? '🔗 URL Node' : '💬 Chat Node'}</span>
        <button 
          className="delete-node" 
          onClick={handleDelete}
          title="Delete node"
        >
          ×
        </button>
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
                  ? { ...n, data: { ...n.data, url: e.target.value } }
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
                <div>
                  {msg.text.split('\n').map((line, index) => (
                    <p style={{
                      textAlign: msg.isUser ? 'right' : 'left'
                    }} key={index}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="chat-input-container">
            <input
              type="text"
              placeholder={!node.data.sourceNodeId ? "Connect to a URL node first..." : "Ask about video..."}
              value={localData.input}
              onChange={(e) => setLocalData({ ...localData, input: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && !loading && node.data.sourceNodeId && handleQuestionSubmit()}
              disabled={loading || !node.data.sourceNodeId}
              className={!node.data.sourceNodeId ? 'disabled' : ''}
            />
            <button 
              onClick={handleQuestionSubmit}
              disabled={loading || !node.data.sourceNodeId}
              className={`${loading ? 'loading' : ''} ${!node.data.sourceNodeId ? 'disabled' : ''}`}
            >
              {loading ? (
                <div className="button-spinner"></div>
              ) : (
                <span className="button-icon">↗️</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default Node;