import React, { useState, useEffect, useRef } from 'react';
import { newInstance } from '@jsplumb/community';
import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Workspace from './components/Workspace';
import './App.css';
import './styles/LandingPage.css';
import Node from './components/Node';
import SEOMetaTags from './components/SEOMetaTags';
import axios from 'axios';

function App() {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const workspaceRef = useRef(null);
  const jsPlumb = useRef(null);
  const currentTranscript = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });

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
        const sourceEndpointKey = info.source.getAttribute('data-key');
        const targetEndpointKey = info.target.getAttribute('data-key');
        const connection = {
          sourceId: sourceEndpointKey,
          targetId: targetEndpointKey
        };
        console.log('connection', connection) 
        
        setConnections([...connections, connection]);

        if (info.source.classList.contains('url-node') && 
            info.target.classList.contains('chat-node')) {
          handleUrlChatConnection(info);
        }
      });

      jsPlumb.current.bind('connectionDetached', (info) => {
        setConnections(prev => 
          prev.filter(conn => 
            conn.sourceId !== info.source.getAttribute('data-key') || 
            conn.targetId !== info.target.getAttribute('data-key')
          )
        );
      });

      return () => jsPlumb.current.destroy();
    }
  }, []);

  const handleUrlSubmit = async (nodeId, url) => {
    if (!url.trim()) return;

    console.log('nodeId', nodeId)
    console.log(nodes)
    
    setNodes(prev => prev.map(n => 
      n.id === nodeId 
        ? { ...n, data: { ...n.data, status: 'processing' }} 
        : n
    ));

    try {
      const response = await axios.post('http://localhost:8000/connect-url-to-chat', {
        url: url,
      });
      
      setNodes(prev => prev.map(n => 
        n.id === nodeId 
          ? { ...n, data: { ...n.data, status: 'completed', url: url }} 
          : n
      ));
    
      
      return response.data.transcript;
    } catch (error) {
      console.error('Error processing URL:', error);
      setNodes(prev => prev.map(n => 
        n.id === nodeId 
          ? { ...n, data: { ...n.data, status: 'error' }} 
          : n
      ));
      throw error;
    }
  };

  const createNode = (type, position) => {
    const node = {
      id: `node-${Date.now()}`,
      type,
      position,
      data: type === 'url' ? { url: '' } : { messages: [], input: '' }
    };
    
    setNodes([...nodes, node]);
    return node;
  };
  
  const handleWorkspaceDoubleClick = (e) => {
    const rect = workspaceRef.current.getBoundingClientRect();
    
    const position = {
      x: e.clientX - rect.left - 100,
      y: e.clientY - rect.top - 50
    };
    console.log('e.altKey', e.altKey)
    createNode(e.altKey ? 'chat' : 'url', position);
  };

  const handleUrlChatConnection = async (info) => {
    console.log('info', info);

    setNodes(prevNodes => {
      const sourceNode = prevNodes.find(n => String(n.id) === info.source.getAttribute('data-key'));
      const targetNode = prevNodes.find(n => String(n.id) === info.target.getAttribute('data-key'));

      if (sourceNode && targetNode) {
        console.log('sourceNode', sourceNode);
        console.log('targetNode', targetNode);

        info.connection.addClass('processing-connection');
        handleUrlSubmit(info.source.getAttribute('data-key'), sourceNode.data.url).then(() => {
          return prevNodes.map(node => {
            if (node.id === targetNode.id) {
              return {
                ...node,
                data: {
                  ...node.data,
                  connectedUrl: sourceNode.data.url,
                  sourceNodeId: sourceNode.id,
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
            if (node.id === sourceNode.id) {
              return {
                ...node,
                data: {
                  ...node.data,
                  status: 'completed',
                  url: sourceNode.data.url
                }
              };
            }
            return node;
          });
        }).then(updatedNodes => {
          setNodes(updatedNodes);
          info.connection.removeClass('processing-connection');
        }).catch(error => {
          console.error('Error processing connection:', error);
          info.connection.removeClass('processing-connection');
        });
      }
      
      return prevNodes; 
    });
  };

  // Handle workspace panning
  const handleMouseDown = (e) => {
    if (e.target === workspaceRef.current) {
      setIsPanning(true);
      setStartPan({
        x: e.clientX + workspaceRef.current.parentElement.scrollLeft,
        y: e.clientY + workspaceRef.current.parentElement.scrollTop
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      const container = workspaceRef.current.parentElement;
      container.scrollLeft = startPan.x - e.clientX;
      container.scrollTop = startPan.y - e.clientY;
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/workspace" element={
          <>
            <SEOMetaTags />
            <div 
              className="workspace-container"
            >
              <div
                ref={workspaceRef}
                className="workspace"
                onDoubleClick={handleWorkspaceDoubleClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {nodes.length === 0 && (
                  <div className="workspace-instructions">
                    <div className="instruction-step">
                      <span className="instruction-icon">🎯</span>
                      <span>Double-click to create URL node</span>
                    </div>
                    <div className="instruction-step">
                      <span className="instruction-icon">⌥</span>
                      <span>Alt + Double-click to create Chat node</span>
                    </div>
                    <div className="instruction-step">
                      <span className="instruction-icon">🔗</span>
                      <span>Connect nodes to start chatting</span>
                    </div>
                  </div>
                )}
                {nodes.map(node => (
                  <Node
                    key={node.id}
                    id={node.id}
                    nodes={nodes}
                    node={node}
                    jsPlumb={jsPlumb.current}
                    setNodes={setNodes}
                    currentTranscript={currentTranscript}
                    handleUrlSubmit={handleUrlSubmit}
                  />
                ))}
              </div>
            </div>
          </>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;