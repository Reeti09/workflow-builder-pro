import React from 'react';

// Helper to get icons based on node type
const getIcon = (type) => {
  if (type === 'start') return '🟣';
  if (type === 'action') return '⚡';
  if (type === 'branch') return '🌿';
  if (type === 'end') return '🏁';
  return '📦';
};

// SVG Connector for the lines between nodes
const SvgConnector = () => React.createElement('svg', { 
  width: "100%", 
  height: "40", 
  viewBox: "0 0 100 40", 
  preserveAspectRatio: "none",
  className: "connector-line"
},
  React.createElement('path', { 
    d: "M 50 0 L 50 40", 
    stroke: "#cbd5e1", 
    strokeWidth: "2", 
    fill: "none" 
  })
);

function Node({ node, onAdd, onDelete, onEdit, selectedId, onSelect }) {
  const isSelected = selectedId === node.id;
  const isStartNode = node.type === 'start' || node.id === 'root';
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Helper to handle adding and closing menu
  const handleAddAndClose = (type) => {
    onAdd(node.id, type);
    setIsMenuOpen(false);
  };

  // Logical Content based on Metadata
  const renderNodeContent = () => {
    if (!node.data) return null;

    // 1. Handle "Condition" / Branch nodes specifically
    if (node.type === 'branch') {
      return React.createElement('div', { className: 'node-content-preview branch-style' },
        React.createElement('div', { className: 'condition-input-wrapper' },
          React.createElement('span', { className: 'meta-tag' }, 'IF'),
          React.createElement('input', {
            className: 'condition-statement-input',
            placeholder: 'Enter condition (e.g. x > 5)',
            value: node.data.condition || '',
            onClick: (e) => e.stopPropagation(),
            onChange: (e) => {
              onEdit(node.id, node.label, { ...node.data, condition: e.target.value });
            }
          })
        ),
        // Interactive Toggle for manual testing of paths
        React.createElement('div', { 
          className: `toggle-ui ${node.data.isEnabled ? 'active' : ''}`, 
          onClick: (e) => {
            e.stopPropagation();
            onEdit(node.id, node.label, { ...node.data, isEnabled: !node.data.isEnabled });
          }
        }, 
          React.createElement('div', { className: 'toggle-knob' })
        ),
        React.createElement('div', { className: 'status-text' }, 
          node.data.isEnabled ? 'Path: TRUE' : 'Path: FALSE'
        )
      );
    }

    // 2. Handle Action elements via switch
    switch (node.label) {
      case 'Input Field':
        return React.createElement('div', { className: 'node-content-preview' },
          React.createElement('span', { className: 'meta-tag' }, `VAR: {${node.data.variable || 'input'}}`),
          React.createElement('div', { className: 'preview-input' }, node.data.placeholder)
        );
      case 'Dropdown':
        return React.createElement('div', { className: 'node-content-preview' },
          React.createElement('span', { className: 'meta-tag' }, `VAR: {${node.data.variable || 'select'}}`),
          React.createElement('select', { 
            className: 'preview-select',
            value: node.data.selectedValue || (node.data.options?.[0] || ''),
            onClick: (e) => e.stopPropagation(),
            onChange: (e) => {
              onEdit(node.id, node.label, { ...node.data, selectedValue: e.target.value });
            }
          },
            node.data.options && node.data.options.length > 0 
              ? node.data.options.map((opt, i) => React.createElement('option', { key: i, value: opt }, opt))
              : React.createElement('option', { disabled: true }, "No options added")
          ),
          React.createElement('div', { className: 'dropdown-editor' },
            React.createElement('button', {
              className: 'add-opt-btn',
              onClick: (e) => {
                e.stopPropagation();
                const newOpt = prompt("Enter new option name:");
                if (newOpt) {
                  const currentOptions = node.data.options || [];
                  onEdit(node.id, node.label, { ...node.data, options: [...currentOptions, newOpt] });
                }
              }
            }, '+ Add Option')
          )
        );
      case 'Date Picker':
        return React.createElement('div', { className: 'node-content-preview' },
          React.createElement('span', { className: 'meta-tag' }, `VAR: {${node.data.variable || 'due_date'}}`),
          React.createElement('input', {
            type: 'date',
            className: 'preview-date-input',
            value: node.data.selectedDate || '',
            onClick: (e) => e.stopPropagation(),
            onChange: (e) => {
              onEdit(node.id, node.label, { ...node.data, selectedDate: e.target.value });
            }
          }),
          node.data.selectedDate && React.createElement('div', { className: 'status-text' }, `Scheduled: ${node.data.selectedDate}`)
        );
      case 'File Upload':
        const fileName = node.data.fileName;
        const isUploaded = !!fileName;
        return React.createElement('div', { className: 'node-content-preview' },
          React.createElement('span', { className: 'meta-tag' }, `VAR: {${node.data.variable || 'attachment'}}`),
          React.createElement('div', { className: `upload-container ${isUploaded ? 'uploaded' : ''}` },
            React.createElement('input', {
              type: 'file',
              id: `file-${node.id}`,
              className: 'hidden-file-input',
              onChange: (e) => {
                const file = e.target.files[0];
                if (file) {
                  onEdit(node.id, node.label, { 
                    ...node.data, 
                    fileName: file.name,
                    fileSize: (file.size / 1024).toFixed(1) + ' KB'
                  });
                }
              }
            }),
            React.createElement('label', { 
              htmlFor: `file-${node.id}`, 
              className: 'upload-label',
              onClick: (e) => e.stopPropagation() 
            }, isUploaded ? '📄 ' + fileName : '📤 Click to upload'),
            isUploaded && React.createElement('button', {
              className: 'remove-file-btn',
              onClick: (e) => {
                e.stopPropagation();
                onEdit(node.id, node.label, { ...node.data, fileName: null, fileSize: null });
              }
            }, 'Remove')
          )
        );
      default:
        return null;
    }
  };

  // Node Card UI
  const card = React.createElement('div', { 
    id: `node-${node.id}`,
    className: `node-card ${node.type} ${isSelected ? 'selected' : ''}`,
    onClick: (e) => { e.stopPropagation(); onSelect(node.id); }
  },
    React.createElement('div', { className: 'node-header' },
      React.createElement('span', { className: 'node-icon' }, getIcon(node.type)),
      React.createElement('div', { className: 'node-actions' },
        //React.createElement('button', { className: 'node-settings' }, '⚙️'),
        !isStartNode && React.createElement('button', {
          className: 'delete-btn', 
          onClick: (e) => { e.stopPropagation(); onDelete(node.id); }
        }, '×')
      )
    ),
    isStartNode 
      ? React.createElement('div', { className: 'node-label-display' }, node.label)
      : React.createElement('input', {
          className: 'node-title-input',
          value: node.label,
          onChange: (e) => onEdit(node.id, e.target.value),
          onClick: (e) => e.stopPropagation()
        }),
    renderNodeContent()
  );

  const addZone = node.type !== 'end' ? React.createElement('div', { className: 'add-zone' },
    React.createElement(SvgConnector),
    React.createElement('div', { className: 'menu-container' },
      React.createElement('button', { 
        className: `main-add-btn ${isMenuOpen ? 'active' : ''}`,
        onClick: (e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }
      }, '+'),
      isMenuOpen && React.createElement('div', { className: 'floating-menu' },
        React.createElement('button', { onClick: () => handleAddAndClose('action') }, '⚡ Action'),
        React.createElement('button', { onClick: () => handleAddAndClose('branch') }, '🌿 Branch'),
        React.createElement('button', { onClick: () => handleAddAndClose('end') }, '🏁 End')
      )
    ),
    React.createElement(SvgConnector)
  ) : null;

  // Children Container with Path Highlighting
  const childrenContainer = node.children && node.children.length > 0 ? 
    React.createElement('div', { 
      className: `children-container ${node.type === 'branch' ? 'horizontal-layout' : ''}` 
    },
      node.children.map((child, index) => {
        const isBranchingNode = node.label === 'Toggle Switch' || node.type === 'branch';
        const isToggleOn = node.data?.isEnabled === true;
        const isActivePath = isBranchingNode ? (isToggleOn ? index === 0 : index === 1) : true; 

        return React.createElement('div', { 
          key: child.id,
          className: `path-wrapper ${isActivePath ? 'path-active' : 'path-inactive'}` 
        },
          React.createElement(Node, { 
            node: child, 
            onAdd, onDelete, onEdit, selectedId, onSelect 
          })
        );
      })
    ) : null;

  return React.createElement('div', { className: 'node-wrapper' }, card, addZone, childrenContainer);
}

export default Node;