
import { IntegrationForm } from './integration-form';
import { Box } from '@mui/material';

function App() {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      width: '100%',
      overflow: 'hidden'
    }}>
      <IntegrationForm />
    </Box>
  );
}

export default App;
