import React, { useState, useCallback, useRef, useEffect } from 'react';
import Node from './components/Node';
import { useWorkflow } from './hooks/useWorkflow';
import { createNode, deleteAndRepair } from './utils/treeUtils';

import './App.css';

// Helper to find node coordinates on the screen
const getNodePosition = (nodeId) => {
  const nodeElement = document.getElementById(`node-${nodeId}`);
  if (nodeElement) {
    const rect = nodeElement.getBoundingClientRect();
    return { 
      x: rect.left + rect.width / 2 + window.scrollX, 
      y: rect.top + rect.height / 2 + window.scrollY 
    };
  }
  return null;
};

function App() {
  const { 
    tree, 
    setTree, 
    undo, 
    redo, 
    exportJSON, 
    canUndo, 
    canRedo 
  } = useWorkflow({ id: 'root', type: 'start', label: 'Start Flow', children: [] });

  const [selectedNodeId, setSelectedNodeId] = useState('root');
  
  // 1. Tooltip Metadata Array
  const menuItems = [
    { id: 'steps', label: 'STEPS', tooltip: 'Manage workflow stages' },
    { id: 'logic', label: 'LOGIC', tooltip: 'Configure branching rules' },
    { id: 'data', label: 'DATA', tooltip: 'View variable mappings' },
  ];

  // --- NEW: NODE COUNT HELPER ---
  const getNodeCounts = (node, counts = { actions: 0, branches: 0, total: 0 }) => {
    if (!node) return counts;
    counts.total += 1;
    if (node.type === 'branch') {
      counts.branches += 1;
    } else if (node.type === 'action' || node.type === 'start') {
      counts.actions += 1;
    }
    if (node.children) {
      node.children.forEach(child => getNodeCounts(child, counts));
    }
    return counts;
  };

  const counts = getNodeCounts(tree);

  // --- AUTO-SAVE LOGIC ---
  useEffect(() => {
    localStorage.setItem('workflow-cache', JSON.stringify(tree));
  }, [tree]);

  // --- Simulation State ---
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationPath, setSimulationPath] = useState([]);
  const [currentSimNodeIndex, setCurrentSimNodeIndex] = useState(-1);
  const [ballPosition, setBallPosition] = useState({ x: 0, y: 0 });
  const animationTimeoutRef = useRef(null);

  const buildSimulationPath = useCallback((currentNode, path = []) => {
    path.push(currentNode.id);
    if (currentNode.type === 'end' || !currentNode.children || currentNode.children.length === 0) {
      return path;
    }

    if (currentNode.type === 'branch' || currentNode.label === 'Toggle Switch') {
      const isToggleOn = currentNode.data?.isEnabled === true;
      const nextChild = isToggleOn ? currentNode.children[0] : currentNode.children[1];
      if (nextChild) return buildSimulationPath(nextChild, path);
    } else {
      const nextChild = currentNode.children[0];
      if (nextChild) return buildSimulationPath(nextChild, path);
    }
    return path;
  }, []);
  

  useEffect(() => {
    if (!isSimulating || simulationPath.length === 0) return;

    const nodeId = simulationPath[currentSimNodeIndex];
    const pos = getNodePosition(nodeId);
    if (pos) setBallPosition(pos);

    if (currentSimNodeIndex >= simulationPath.length - 1) {
      animationTimeoutRef.current = setTimeout(() => {
        setIsSimulating(false);
        setCurrentSimNodeIndex(-1);
      }, 1500);
      return;
    }

    animationTimeoutRef.current = setTimeout(() => {
      setCurrentSimNodeIndex(prev => prev + 1);
    }, 1000);

    return () => clearTimeout(animationTimeoutRef.current);
  }, [isSimulating, simulationPath, currentSimNodeIndex]);

  const startSimulation = () => {
    const path = buildSimulationPath(tree);
    setSimulationPath(path);
    setCurrentSimNodeIndex(0);
    setIsSimulating(true);
  };

  const handleAdd = (parentId, type) => {
    const newNode = createNode(type, type === 'branch' ? 'Condition' : 'New Step');
    if (type === 'branch') {
      newNode.children = [createNode('action', 'True Path'), createNode('action', 'False Path')];
    }
    const insertRecursive = (node) => {
      if (node.id === parentId) return { ...node, children: [...node.children, newNode] };
      return { ...node, children: node.children.map(insertRecursive) };
    };
    setTree(insertRecursive(tree));
  };

  const handleLibraryAdd = (name) => {
    let type = 'action';
    let metadata = {};
    if (name === 'Toggle Switch') { type = 'branch'; metadata = { isEnabled: false }; }
    
    const newNode = createNode(type, name, metadata);
    if (type === 'branch') {
      newNode.children = [createNode('action', 'True Path'), createNode('action', 'False Path')];
    }

    const insertRecursive = (node) => {
      if (node.id === selectedNodeId) return { ...node, children: [...node.children, newNode] };
      return { ...node, children: node.children.map(insertRecursive) };
    };
    setTree(insertRecursive(tree));
  };

  const handleDelete = (id) => setTree(deleteAndRepair(tree, id));
  
  const handleEdit = (id, newLabel, newData = null) => {
    const updateRecursive = (node) => {
      if (node.id === id) return { ...node, label: newLabel, data: newData || node.data };
      return { ...node, children: node.children.map(updateRecursive) };
    };
    setTree(updateRecursive(tree));
  };

  const handleCapture = () => {
    window.print();
  };

  const toolbar = React.createElement('div', { className: 'toolbar' },
    React.createElement('button', { className: 'simulate-btn', onClick: startSimulation, disabled: isSimulating }, isSimulating ? '⌛ Simulating...' : '▶ Simulate Flow'),
    React.createElement('button', { onClick: undo, disabled: !canUndo }, '↩ Undo'),
    React.createElement('button', { onClick: redo, disabled: !canRedo }, '↪ Redo'),
    React.createElement('button', { onClick: exportJSON, className: 'export-btn' }, '💾 Export JSON'),
    React.createElement('button', { onClick: handleCapture, className: 'capture-btn' }, '📸 Save Image')
  );

  return React.createElement('div', { className: 'app-shell' },
    isSimulating && React.createElement('div', { 
      className: 'simulation-ball',
      style: { left: `${ballPosition.x}px`, top: `${ballPosition.y}px` }
    }),

    React.createElement('aside', { className: 'sidebar-left' }, 
      React.createElement('div', { className: 'logo' }, '⚡'),
      React.createElement('nav', { className: 'side-nav' }, 
        menuItems.map(item => 
          React.createElement('div', { key: item.id, className: 'sidebar-item-container' },
            React.createElement('button', { className: 'nav-item' }, item.label),
            React.createElement('span', { className: 'sidebar-tooltip' }, item.tooltip)
          )
        )
      )
    ),

    React.createElement('main', { className: 'canvas-area' },
      React.createElement('header', { className: 'canvas-header' },
        React.createElement('input', { className: 'workflow-name-input', defaultValue: 'Untitled Workflow' }),
        toolbar
      ),
      React.createElement('div', { className: 'workflow-viewport' },
        React.createElement('div', { className: 'workflow-container' },
          React.createElement(Node, { 
            node: tree, 
            onAdd: handleAdd, 
            onDelete: handleDelete, 
            onEdit: handleEdit,
            selectedId: selectedNodeId,
            onSelect: setSelectedNodeId
          })
        ),
        // UPDATED: Added the statistics summary block
        React.createElement('div', { className: 'print-summary' },
          React.createElement('h4', null, 'Workflow Statistics'),
          React.createElement('p', null, `Total Steps: ${counts.total}`),
          React.createElement('p', null, `Action Nodes: ${counts.actions}`),
          React.createElement('p', null, `Logical Branches: ${counts.branches}`)
        )
      )
    ),

    React.createElement('aside', { className: 'sidebar-right' },
      React.createElement('h3', null, 'Control Library'),
      React.createElement('div', { className: 'control-list' },
        [
          { name: 'Input Field', icon: '📝' },
          { name: 'Toggle Switch', icon: '🌿' },
          { name: 'Dropdown', icon: '🔽' },
          { name: 'Date Picker', icon: '📅' },
          { name: 'File Upload', icon: '📁' }
        ].map(item => 
          React.createElement('button', { 
            key: item.name, 
            className: 'draggable-item',
            onClick: () => handleLibraryAdd(item.name)
          }, 
          React.createElement('span', null, item.icon),
          item.name
          )
        )
      )
    )
  );
}

export default App;