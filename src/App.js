import React, { useState, useEffect, useRef } from 'react';
import { newInstance } from '@jsplumb/community';
import './App.css';


function App() {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const workspaceRef = useRef(null);
  const jsPlumb = useRef(null);
  const currentTranscript = useRef(null);


  console.log('hello')
  // Initialize jsPlumb
  useEffect(() => {
    if (workspaceRef.current) {
      jsPlumb.current = newInstance({
        container: workspaceRef.current,
        connector: ["Bezier", { 
          curviness: 60,
          stub: [10, 30],
          gap: 8,
          cornerRadius: 5
        }],
        paintStyle: { 
          stroke: "#4CAF50",
          strokeWidth: 2
        },
        hoverPaintStyle: { 
          stroke: "#45a049",
          strokeWidth: 3
        },
        endpoint: ["Dot", { 
          radius: 5,
          fill: "#4CAF50" 
        }],
        cssClass: "connection-line",
        dragOptions: { cursor: 'pointer' },
        connectionOverlays: [
          ["Arrow", {
            location: 1,
            width: 10,
            length: 10,
            foldback: 0.7
          }]
        ]
      });

      jsPlumb.current.bind('connection', (info) => {
        const connection = {
          sourceId: info.source.id,
          targetId: info.target.id
        };
        
        setConnections(prev => [...prev, connection]);

        if (info.source.classList.contains('url-node') && 
            info.target.classList.contains('chat-node')) {
          handleUrlChatConnection(info);
        }
      });

      jsPlumb.current.bind('connectionDetached', (info) => {
        setConnections(prev => 
          prev.filter(conn => 
            conn.sourceId !== info.source.id || 
            conn.targetId !== info.target.id
          )
        );
      });

      return () => jsPlumb.current.destroy();
    }
  }, []);

  // Create nodes
  const createNode = (type, position) => {
    const node = {
      id: `node-${Date.now()}`,
      type,
      position,
      data: type === 'url' ? { url: '' } : { messages: [], input: '' }
    };
    
    setNodes(prev => [...prev, node]);
    return node;
  };

  

  // Handle workspace double click
  const handleWorkspaceDoubleClick = (e) => {
    const rect = workspaceRef.current.getBoundingClientRect();
    const position = {
      x: e.clientX - rect.left - 100,
      y: e.clientY - rect.top - 50
    };
    createNode(e.altKey ? 'chat' : 'url', position);
  };

  // Handle URL to Chat connection
  const handleUrlChatConnection = async (info) => {
    const sourceNode = nodes.find(n => n.id === info.source.id);
    const targetNode = nodes.find(n => n.id === info.target.id);

    if (sourceNode && targetNode) {
      // Add processing class to the connection
      info.connection.addClass('processing-connection');

      try {
        // Simulate processing time - replace with actual processing if needed
        await new Promise(resolve => setTimeout(resolve, 2000));

        setNodes(prev => prev.map(node => {
          if (node.id === targetNode.id) {
            return {
              ...node,
              data: {
                ...node.data,
                connectedUrl: sourceNode.data.url,
                messages: [
                  ...node.data.messages,
                  { 
                    text: `Connected to video: ${sourceNode.data.url}`, 
                    isUser: false 
                  }
                ]
              }
            };
          }
          return node;
        }));

        // Remove processing class and add the label
        info.connection.removeClass('processing-connection');
        info.connection.addOverlay([
          'Label', 
          { 
            label: 'Connected', 
            location: 0.5,
            cssClass: 'connection-label'
          }
        ]);
      } catch (error) {
        console.error('Error processing connection:', error);
        info.connection.removeClass('processing-connection');
      }
    }
  };

  return (
      <div 
        className="workspace" 
        ref={workspaceRef}
        onDoubleClick={handleWorkspaceDoubleClick}
      >
        {nodes.map(node => (
          <Node
            key={node.id}
            node={node}
            jsPlumb={jsPlumb.current}
            setNodes={setNodes}
            currentTranscript={currentTranscript}
          />
        ))}
      </div>
  );
}

const Node = React.memo(({ node, jsPlumb, setNodes, currentTranscript }) => {
  const nodeRef = useRef(null);
  const [localData, setLocalData] = useState(node.data);

  // Initialize jsPlumb for node
  useEffect(() => {
    if (nodeRef.current && jsPlumb) {
      // Make node draggable
      jsPlumb.manage(nodeRef.current);
      
      // Add source endpoint for URL nodes
      if (node.type === 'url') {
        jsPlumb.addEndpoint(nodeRef.current, {
          anchor: "Bottom",
          isSource: true,
          isTarget: false,
          connector: ["Bezier", { curviness: 60 }],
          maxConnections: -1,
          endpoint: ["Dot", { radius: 5 }],
          paintStyle: { fill: "#4CAF50" },
          hoverPaintStyle: { fill: "#45a049" }
        });
      }

      // Add target endpoint for chat nodes
      if (node.type === 'chat') {
        jsPlumb.addEndpoint(nodeRef.current, {
          anchor: "Top",
          isSource: false,
          isTarget: true,
          maxConnections: -1,
          endpoint: ["Dot", { radius: 5 }],
          paintStyle: { fill: "#4CAF50" },
          hoverPaintStyle: { fill: "#45a049" }
        });
      }

      // Enable dragging
      jsPlumb.setDraggable(nodeRef.current, true);
    }

    return () => {
      if (jsPlumb && nodeRef.current) {
        jsPlumb.removeAllEndpoints(nodeRef.current);
        jsPlumb.unmanage(nodeRef.current);
      }
    };
  }, [jsPlumb, node.type]);

  // Handle chat questions
  const handleQuestionSubmit = async () => {
    if (!localData.input.trim()) return;

    try {
      const response = await fetch('/api/ask-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: localData.input,
          transcript: currentTranscript.current
        })
      });

      const data = await response.json();
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
  };

  // Add this function inside the Node component
  const handleUrlSubmit = async (url) => {
    if (!url.trim()) return;
    
    setLocalData(prev => ({ ...prev, status: 'processing' }));
    setNodes(prev => prev.map(n => 
      n.id === node.id 
        ? { ...n, data: { ...n.data, status: 'processing' }} 
        : n
    ));

    try {
      // Replace this with your actual video processing API call
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing
      
      setLocalData(prev => ({ ...prev, status: 'completed' }));
      setNodes(prev => prev.map(n => 
        n.id === node.id 
          ? { ...n, data: { ...n.data, status: 'completed' }} 
          : n
      ));
    } catch (error) {
      console.error('Error processing URL:', error);
      setLocalData(prev => ({ ...prev, status: 'error' }));
    }
  };

  return (
    <div
      ref={nodeRef}
      className={`node ${node.type}-node ${node.data.connectedUrl ? 'connected' : ''}`}
      style={{
        left: node.position.x,
        top: node.position.y
      }}
    >
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
            onBlur={() => handleUrlSubmit(localData.url)}
          />
          {localData.status === 'processing' && (
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
                {msg.text}
              </div>
            ))}
          </div>
          <input
            type="text"
            placeholder="Ask about video..."
            value={localData.input}
            onChange={(e) => setLocalData({ ...localData, input: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && handleQuestionSubmit()}
          />
          <button onClick={handleQuestionSubmit}>Ask</button>
        </div>
      )}
    </div>
  );
});

export default App;