# ⚡ Workflow Builder Pro

An interactive, node-based workflow editor built with **React.js**. This tool enables users to design, simulate, and export complex logic flows with a focus on seamless user experience and data persistence.

## 🚀 Deployment & Source
* **Live Demo:** [https://workflow-builder-lovat-five.vercel.app/](https://workflow-builder-lovat-five.vercel.app/)
* **GitHub Repository:** [https://github.com/Reeti09/workflow-builder-pro](https://github.com/Reeti09/workflow-builder-pro)

---

## ✨ Key Features

### 1. Interactive Canvas & Node Management
* **Dynamic Creation**: Add **Action**, **Branch**, and **End** nodes via a context-sensitive floating menu.
* **Logical Branching**: Configure "Toggle Switch" conditions to simulate "True/False" branching paths.
* **Tree Repair**: Deleting a node automatically repairs the tree structure to maintain workflow integrity.

### 2. Real-Time Flow Simulation
* **Path Tracing**: A visual simulation ball traverses the workflow, following logic set by the user.
* **Visual Feedback**: Active paths are highlighted while inactive routes are dimmed during simulation.

### 3. Data Persistence & Export
* **Auto-Save**: Integrated `localStorage` engine saves the workflow state on every change to prevent data loss.
* **JSON Export**: Download the entire hierarchical data structure as a portable JSON file.
* **Visual Snapshot**: Optimized print-media queries allow for clean image/PDF exports, including a **Workflow Statistics** summary (Total Steps, Actions, and Branches).

---

## 🛠️ Technical Stack
* **Frontend**: React.js (Hooks, Functional Components)
* **State Management**: Custom `useWorkflow` hook for history (Undo/Redo) and tree manipulation.
* **Styling**: CSS3 with Flexbox, Grid, and Print Media Queries for professional exports.
* **Deployment**: Vercel (CI/CD via GitHub).

---

## 🏆 Bonus Points Implemented
To demonstrate a higher level of skill, the following features were added:
* **[✓] Undo/Redo System**: Full structural history tracking for adding/deleting nodes.
* **[✓] Saving/Loading**: Persistent storage via `localStorage` and manual JSON export.
* **[✓] Context-Sensitive UI**: A clean pop-over menu for adding specific node types.
* **[✓] Advanced UX**: Sidebar hover tooltips and optimized vertical spacing for better scannability.

---

## 📥 Local Installation

1. **Clone the repository**:
   ```bash
   git clone [https://github.com/Reeti09/workflow-builder-pro.git](https://github.com/Reeti09/workflow-builder-pro.git)
## Install dependencies:

```bash
  npm install
```
    

## Run Development Server:

```bash
  npm start
```
    
