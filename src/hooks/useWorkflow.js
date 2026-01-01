import { useState, useCallback } from 'react';

export function useWorkflow(initialTree) {
  const [history, setHistory] = useState([initialTree]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentTree = history[currentIndex];

  const pushState = useCallback((newTree) => {
    const newHistory = history.slice(0, currentIndex + 1);
    setHistory([...newHistory, newTree]);
    setCurrentIndex(newHistory.length);
  }, [history, currentIndex]);

  const undo = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const redo = () => {
    if (currentIndex < history.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentTree, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "workflow_design.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return {
    tree: currentTree,
    setTree: pushState,
    undo,
    redo,
    exportJSON,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1
  };
}