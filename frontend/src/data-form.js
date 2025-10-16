import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Divider,
  Link,
  Container
} from '@mui/material';
import axios from 'axios';

const endpointMapping = {
  'Notion': 'notion',
  'Airtable': 'airtable',
  'HubSpot': 'hubspot',
};

export const DataForm = ({ integrationType, credentials }) => {
  const [loadedData, setLoadedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const endpoint = endpointMapping[integrationType];

  const handleLoad = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('credentials', JSON.stringify(credentials));
      const response = await axios.post(`http://localhost:8000/integrations/${endpoint}/load`, formData);
      const data = response.data;
      setLoadedData(data);
      setLoading(false);
    } catch (e) {
      alert(e?.response?.data?.detail);
      setLoading(false);
    }
  };

  const renderHubSpotData = () => {
    if (!loadedData || !Array.isArray(loadedData)) return null;

    // Group by type
    const contacts = loadedData.filter(item => item.type === 'contact');
    const companies = loadedData.filter(item => item.type === 'company');
    const deals = loadedData.filter(item => item.type === 'deal');

    return (
      <Box sx={{ mt: 3 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 3, 
            fontWeight: 'bold',
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
          }}
        >
          📊 HubSpot Data Summary
        </Typography>
        
        {/* Summary Cards - Responsive Grid */}
        <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4} md={4}>
            <Card sx={{ backgroundColor: '#e3f2fd', height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 2, sm: 3 } }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: '#1976d2',
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                  }}
                >
                  {contacts.length}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="textSecondary"
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  👤 Contacts
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4} md={4}>
            <Card sx={{ backgroundColor: '#f3e5f5', height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 2, sm: 3 } }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: '#7b1fa2',
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                  }}
                >
                  {companies.length}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="textSecondary"
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  🏢 Companies
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4} md={4}>
            <Card sx={{ backgroundColor: '#e8f5e9', height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 2, sm: 3 } }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: '#388e3c',
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                  }}
                >
                  {deals.length}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="textSecondary"
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  💰 Deals
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Contacts Section */}
        {contacts.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2, 
                fontWeight: 'bold',
                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
              }}
            >
              👤 Contacts ({contacts.length})
            </Typography>
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
              {contacts.map((contact, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      '&:hover': { 
                        boxShadow: { xs: 3, sm: 6 },
                        transform: { sm: 'translateY(-4px)' },
                        transition: 'all 0.3s ease'
                      }
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                      <Chip 
                        label="Contact" 
                        size="small" 
                        color="primary" 
                        sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.8125rem' } }} 
                      />
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold', 
                          mb: 1,
                          fontSize: { xs: '1rem', sm: '1.125rem' },
                          wordBreak: 'break-word'
                        }}
                      >
                        {contact.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="textSecondary" 
                        sx={{ 
                          mb: 0.5,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        ID: {contact.id}
                      </Typography>
                      {contact.creation_time && (
                        <Typography 
                          variant="body2" 
                          color="textSecondary" 
                          sx={{ 
                            mb: 1,
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}
                        >
                          Created: {new Date(contact.creation_time).toLocaleDateString()}
                        </Typography>
                      )}
                      {contact.url && (
                        <Link 
                          href={contact.url} 
                          target="_blank" 
                          rel="noopener"
                          sx={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            display: 'block',
                            mt: 1
                          }}
                        >
                          View in HubSpot →
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Companies Section */}
        {companies.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2, 
                fontWeight: 'bold',
                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
              }}
            >
              🏢 Companies ({companies.length})
            </Typography>
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
              {companies.map((company, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      '&:hover': { 
                        boxShadow: { xs: 3, sm: 6 },
                        transform: { sm: 'translateY(-4px)' },
                        transition: 'all 0.3s ease'
                      }
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                      <Chip 
                        label="Company" 
                        size="small" 
                        color="secondary" 
                        sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.8125rem' } }} 
                      />
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold', 
                          mb: 1,
                          fontSize: { xs: '1rem', sm: '1.125rem' },
                          wordBreak: 'break-word'
                        }}
                      >
                        {company.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="textSecondary" 
                        sx={{ 
                          mb: 0.5,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        ID: {company.id}
                      </Typography>
                      {company.creation_time && (
                        <Typography 
                          variant="body2" 
                          color="textSecondary" 
                          sx={{ 
                            mb: 1,
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}
                        >
                          Created: {new Date(company.creation_time).toLocaleDateString()}
                        </Typography>
                      )}
                      {company.url && (
                        <Link 
                          href={company.url} 
                          target="_blank" 
                          rel="noopener"
                          sx={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            display: 'block',
                            mt: 1
                          }}
                        >
                          View in HubSpot →
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Deals Section */}
        {deals.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2, 
                fontWeight: 'bold',
                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
              }}
            >
              💰 Deals ({deals.length})
            </Typography>
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
              {deals.map((deal, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      '&:hover': { 
                        boxShadow: { xs: 3, sm: 6 },
                        transform: { sm: 'translateY(-4px)' },
                        transition: 'all 0.3s ease'
                      }
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                      <Chip 
                        label="Deal" 
                        size="small" 
                        color="success" 
                        sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.8125rem' } }} 
                      />
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold', 
                          mb: 1,
                          fontSize: { xs: '1rem', sm: '1.125rem' },
                          wordBreak: 'break-word'
                        }}
                      >
                        {deal.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="textSecondary" 
                        sx={{ 
                          mb: 0.5,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        ID: {deal.id}
                      </Typography>
                      {deal.creation_time && (
                        <Typography 
                          variant="body2" 
                          color="textSecondary" 
                          sx={{ 
                            mb: 1,
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}
                        >
                          Created: {new Date(deal.creation_time).toLocaleDateString()}
                        </Typography>
                      )}
                      {deal.url && (
                        <Link 
                          href={deal.url} 
                          target="_blank" 
                          rel="noopener"
                          sx={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            display: 'block',
                            mt: 1
                          }}
                        >
                          View in HubSpot →
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />
        
        {/* Raw JSON (collapsible) */}
        <details>
          <summary 
            style={{ 
              cursor: 'pointer', 
              fontWeight: 'bold', 
              marginBottom: '10px',
              fontSize: 'clamp(0.875rem, 2vw, 1rem)'
            }}
          >
            📄 View Raw JSON Data
          </summary>
          <Box sx={{ 
            backgroundColor: '#f5f5f5', 
            p: { xs: 1.5, sm: 2 }, 
            borderRadius: 1, 
            overflow: 'auto',
            maxHeight: { xs: '300px', sm: '400px' },
            fontFamily: 'monospace',
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(loadedData, null, 2)}
            </pre>
          </Box>
        </details>
      </Box>
    );
  };

  const renderOtherData = () => {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2,
            fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
          }}
        >
          Loaded Data:
        </Typography>
        <Box sx={{ 
          backgroundColor: '#f5f5f5', 
          p: { xs: 1.5, sm: 2 }, 
          borderRadius: 1, 
          overflow: 'auto',
          maxHeight: { xs: '400px', sm: '500px' },
          fontFamily: 'monospace',
          fontSize: { xs: '0.75rem', sm: '0.875rem' }
        }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(loadedData, null, 2)}
          </pre>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        gap: { xs: 1, sm: 2 }, 
        mt: 2,
        flexDirection: { xs: 'column', sm: 'row' }
      }}>
        <Button 
          onClick={handleLoad} 
          variant='contained' 
          disabled={loading}
          fullWidth={true}
          sx={{ 
            fontSize: { xs: '0.875rem', sm: '1rem' },
            py: { xs: 1, sm: 1.5 }
          }}
        >
          {loading ? 'Loading...' : 'Load Data'}
        </Button>
        {loadedData && (
          <Button 
            onClick={() => setLoadedData(null)} 
            variant='outlined'
            fullWidth={true}
            sx={{ 
              fontSize: { xs: '0.875rem', sm: '1rem' },
              py: { xs: 1, sm: 1.5 }
            }}
          >
            Clear Data
          </Button>
        )}
      </Box>
      
      {loadedData && (
        integrationType === 'HubSpot' 
          ? renderHubSpotData() 
          : renderOtherData()
      )}
    </Box>
  );
};
