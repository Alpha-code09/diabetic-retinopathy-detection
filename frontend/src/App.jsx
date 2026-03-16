import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import RequireAuth from './components/RequireAuth';
import Login from './components/Login';
import Register from './components/Register';
import CNNRetinaNet from './components/CNNRetinaNet';
import ResNetClassifier from './components/ResNetClassifier';
import EnsembleVision from './components/EnsembleVision';
import TransformerDR from './components/TransformerDR';
import HybridNeuralNet from './components/HybridNeuralNet';
import { useAuth } from './context/AuthContext';

function HomeRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/cnn-retinanet' : '/login'} replace />;
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <Routes>
        <Route path="/" element={<HomeRedirect />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/cnn-retinanet"
          element={
            <RequireAuth>
              <CNNRetinaNet />
            </RequireAuth>
          }
        />
        <Route
          path="/resnet-classifier"
          element={
            <RequireAuth>
              <ResNetClassifier />
            </RequireAuth>
          }
        />
        <Route
          path="/ensemble-vision"
          element={
            <RequireAuth>
              <EnsembleVision />
            </RequireAuth>
          }
        />
        <Route
          path="/transformer-dr"
          element={
            <RequireAuth>
              <TransformerDR />
            </RequireAuth>
          }
        />
        <Route
          path="/hybrid-neural-net"
          element={
            <RequireAuth>
              <HybridNeuralNet />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
