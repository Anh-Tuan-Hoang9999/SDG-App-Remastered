import React, { useState } from 'react';

const TestAPI = () => {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const simulateAPI = (endpoint, method = 'GET', body = null, headers = {}) => {
    setLoading(true);
    setTimeout(() => {
      let mockResponse = {};
      switch (endpoint) {
        case '/api/auth/login':
          mockResponse = { access_token: 'mock_jwt_token', token_type: 'bearer' };
          break;
        case '/api/auth/register':
          mockResponse = { id: 1, email: 'test@example.com', name: 'Test User', role: 'student' };
          break;
        case '/api/sdgs':
          mockResponse = [
            { id: 1, number: 1, title: 'No Poverty', description: 'End poverty in all its forms everywhere' },
            { id: 2, number: 2, title: 'Zero Hunger', description: 'End hunger, achieve food security' }
          ];
          break;
        case '/api/discussion/posts':
          if (method === 'POST') {
            mockResponse = { id: 1, title: 'Mock Post', body: 'Mock body', created_at: new Date().toISOString() };
          } else {
            mockResponse = [{ id: 1, title: 'Mock Post', body: 'Mock body', author_name: 'User' }];
          }
          break;
        case '/api/progress':
          mockResponse = { completed_quiz: true, completed_card_sort: false, reflection_count: 2 };
          break;
        case '/api/quiz/questions':
          mockResponse = [
            { id: 1, question_text: 'Mock question?', option_a: 'A', option_b: 'B', correct_option: 'a' }
          ];
          break;
        default:
          mockResponse = { message: 'Mock response for ' + endpoint };
      }
      setResponse(`Request: ${method} ${endpoint}\nBody: ${JSON.stringify(body)}\n\nResponse:\n${JSON.stringify(mockResponse, null, 2)}`);
      setLoading(false);
    }, 500); // Simulate delay
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test API Page - Mock Simulations</h1>
      <p>Simulate frontend actions without real backend connection.</p>

      <div style={{ marginBottom: '20px' }}>
        <h3>Auth Actions</h3>
        <button onClick={() => simulateAPI('/api/auth/login', 'POST', { email: 'test@example.com', password: 'pass' })}>
          Simulate Login
        </button>
        <button onClick={() => simulateAPI('/api/auth/register', 'POST', { name: 'Test', email: 'test@example.com', password: 'pass' })}>
          Simulate Register
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>SDG Actions</h3>
        <button onClick={() => simulateAPI('/api/sdgs')}>
          Get SDGs
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Discussion Actions</h3>
        <button onClick={() => simulateAPI('/api/discussion/posts', 'POST', { title: 'New Post', body: 'Content' })}>
          Post Discussion
        </button>
        <button onClick={() => simulateAPI('/api/discussion/posts')}>
          Get Discussions
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Progress Actions</h3>
        <button onClick={() => simulateAPI('/api/progress')}>
          Get Progress
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Quiz Actions</h3>
        <button onClick={() => simulateAPI('/api/quiz/questions')}>
          Get Quiz Questions
        </button>
      </div>

      {loading && <p>Loading...</p>}
      <pre style={{ marginTop: '20px', background: '#f4f4f4', padding: '10px', whiteSpace: 'pre-wrap' }}>
        {response}
      </pre>
    </div>
  );
};

export default TestAPI;