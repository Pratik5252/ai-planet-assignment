import './App.css';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';
import Layout from './Layout';
import WorkflowManagement from './pages/WorkflowManagement';
import WorkflowEditor from './pages/WorkflowEditor';

const App = () => {
    return (
        <Router>
            <Routes>
                {/* Workflow management dashboard */}
                <Route path="/workflows" element={<WorkflowManagement />} />

                {/* Individual workflow editor (wraps ReactFlowDemo) */}
                <Route
                    path="/workflow/:id"
                    element={
                        <Layout>
                            <WorkflowEditor />
                        </Layout>
                    }
                />

                {/* Default route - redirect to workflows */}
                <Route
                    path="/"
                    element={<Navigate to="/workflows" replace />}
                />

                {/* 404 fallback */}
                <Route
                    path="*"
                    element={<Navigate to="/workflows" replace />}
                />
            </Routes>
        </Router>
    );
};

export default App;
