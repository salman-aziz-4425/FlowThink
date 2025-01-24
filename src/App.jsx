import React, { useState, useEffect, useRef } from 'react';
import { newInstance } from '@jsplumb/community';
import './App.css';
import Node from './components/Node';


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
  const sourceEndpointKey = info.source.getAttribute('data-key');
  const targetEndpointKey = info.target.getAttribute('data-key');
        const connection = {
          sourceId: sourceEndpointKey,
          targetId: targetEndpointKey
        };
        console.log('connection', connection) 
        
        setConnections(prev => [...prev, connection]);

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
    console.log('e.altKey', e.altKey)
    createNode(e.altKey ? 'chat' : 'url', position);
  };


  // Handle URL to Chat connection
  const handleUrlChatConnection = async (info) => {
    const sourceNode = nodes.find(n => n.id === info.source.getAttribute('data-key'));
    const targetNode = nodes.find(n => n.id === info.target.getAttribute('data-key'));
    if (sourceNode && targetNode) {
      console.log('sourceNode', sourceNode)
      console.log('targetNode', targetNode)
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
            id={node.id}
            node={node}
            jsPlumb={jsPlumb.current}
            setNodes={setNodes}
            currentTranscript={currentTranscript}
          />
        ))}
      </div>
  );
}

export default App;