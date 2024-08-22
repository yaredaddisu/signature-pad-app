import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignaturePadComponent from './SignaturePadComponent';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/signature" element={<SignaturePadComponent />} />
                {/* Add other routes as needed */}
            </Routes>
        </Router>
    );
}

export default App;
