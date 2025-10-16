import { useState } from 'react';
import {
  Box,
  Autocomplete,
  TextField,
  Container,
  Paper,
  Typography
} from '@mui/material';
import { AirtableIntegration } from './integrations/airtable';
import { NotionIntegration } from './integrations/notion';
import { HubSpotIntegration } from './integrations/hubspot';
import { DataForm } from './data-form';

const integrationMapping = {
  'Notion': NotionIntegration,
  'Airtable': AirtableIntegration,
  'HubSpot': HubSpotIntegration,
};

export const IntegrationForm = () => {
  const [integrationParams, setIntegrationParams] = useState({});
  const [user, setUser] = useState('TestUser');
  const [org, setOrg] = useState('TestOrg');
  const [currType, setCurrType] = useState(null);

  const CurrIntegration = integrationMapping[currType];

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 2, sm: 3 }
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 2
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 3,
            fontWeight: 'bold',
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
            textAlign: 'center'
          }}
        >
          🔗 Integration Hub
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 2
        }}>
          <TextField
            label="User ID"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            fullWidth
            sx={{
              '& .MuiInputBase-input': {
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }
            }}
          />
          <TextField
            label="Organization ID"
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            fullWidth
            sx={{
              '& .MuiInputBase-input': {
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }
            }}
          />
          <Autocomplete
            options={Object.keys(integrationMapping)}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Integration"
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }
                }}
              />
            )}
            onChange={(e, value) => setCurrType(value)}
            fullWidth
          />
          
          {currType && (
            <CurrIntegration 
              user={user} 
              org={org} 
              integrationParams={integrationParams} 
              setIntegrationParams={setIntegrationParams} 
            />
          )}
          
          {integrationParams?.credentials && (
            <DataForm 
              integrationType={integrationParams.type} 
              credentials={integrationParams.credentials} 
            />
          )}
        </Box>
      </Paper>
    </Container>
  );
};
