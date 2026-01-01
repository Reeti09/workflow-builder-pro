// Ensure your initial state or reset logic creates this root
export const initialTree = {
  id: 'root',
  type: 'start', // Changed from 'action' to 'start'
  label: 'Start Flow',
  children: [],
  data: { isRoot: true }
};
export const createNode = (type, label, metadata = {}) => {
  const baseNode = {
    id: Math.random().toString(36).substr(2, 9),
    type: type,
    label: label,
    children: [],
    data: { ...metadata }
  };

  // Assign specific functional data based on the tool type
  if (label === 'Input Field') {
    baseNode.data = { variable: 'user_input', placeholder: 'Enter text...', ...metadata };
  } else if (label === 'Toggle Switch') {
    baseNode.type = 'branch';
    baseNode.data = { condition: 'is_active', ...metadata };
    // Branches MUST have two starting paths to work
    baseNode.children = [
      { id: Math.random().toString(36).substr(2, 9), type: 'action', label: 'True Path', children: [], data: {} },
      { id: Math.random().toString(36).substr(2, 9), type: 'action', label: 'False Path', children: [], data: {} }
    ];
  } else if (label === 'Dropdown') {
    baseNode.data = { variable: 'category_select', options: ['Option A', 'Option B'], ...metadata };
  } else if (label === 'Date Picker') {
    baseNode.data = { variable: 'due_date', format: 'MM/DD/YYYY', ...metadata };
  } else if (label === 'File Upload') {
    baseNode.data = { variable: 'attachment_id', maxSize: '5MB', ...metadata };
  }

  return baseNode;
};


export const deleteAndRepair = (node, targetId) => {
  const index = node.children.findIndex(child => child.id === targetId);
  if (index !== -1) {
    const deletedNode = node.children[index];
    const newChildren = [...node.children];
    newChildren.splice(index, 1, ...deletedNode.children);
    return { ...node, children: newChildren };
  }
  return { ...node, children: node.children.map(child => deleteAndRepair(child, targetId)) };
};