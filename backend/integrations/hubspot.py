# hubspot.py
import json
import secrets
from fastapi import Request, HTTPException
from fastapi.responses import HTMLResponse
import httpx
import asyncio
from integrations.integration_item import IntegrationItem
from redis_client import add_key_value_redis, get_value_redis, delete_key_redis

CLIENT_ID = 'keep your client id'  # Replace with your actual HubSpot Client ID
CLIENT_SECRET = 'Keep you secret key'  # Replace with your actual HubSpot Client Secret
REDIRECT_URI = 'http://localhost:8000/integrations/hubspot/oauth2callback'

# Define scopes for HubSpot API access
SCOPES = 'crm.objects.contacts.read crm.objects.companies.read crm.objects.deals.read'

authorization_url = f'keep your auth url here'

async def authorize_hubspot(user_id, org_id):
    """
    Generate authorization URL with state parameter for security
    """
    state_data = {
        'state': secrets.token_urlsafe(32),
        'user_id': user_id,
        'org_id': org_id
    }
    
    encoded_state = json.dumps(state_data)
    await add_key_value_redis(f'hubspot_state:{org_id}:{user_id}', encoded_state, expire=600)
    
    return f'{authorization_url}&state={encoded_state}'

async def oauth2callback_hubspot(request: Request):
    """
    Handle OAuth callback and exchange authorization code for access token
    """
    if request.query_params.get('error'):
        raise HTTPException(status_code=400, detail=request.query_params.get('error'))
    
    code = request.query_params.get('code')
    encoded_state = request.query_params.get('state')
    state_data = json.loads(encoded_state)
    
    original_state = state_data.get('state')
    user_id = state_data.get('user_id')
    org_id = state_data.get('org_id')
    
    # Verify state to prevent CSRF attacks
    saved_state = await get_value_redis(f'hubspot_state:{org_id}:{user_id}')
    
    if not saved_state or original_state != json.loads(saved_state).get('state'):
        raise HTTPException(status_code=400, detail='State does not match.')
    
    # Exchange authorization code for access token
    async with httpx.AsyncClient() as client:
        response, _ = await asyncio.gather(
            client.post(
                'https://api.hubapi.com/oauth/v1/token',
                data={
                    'grant_type': 'authorization_code',
                    'code': code,
                    'redirect_uri': REDIRECT_URI,
                    'client_id': CLIENT_ID,
                    'client_secret': CLIENT_SECRET
                },
                headers={
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            ),
            delete_key_redis(f'hubspot_state:{org_id}:{user_id}')
        )
    
    # Store credentials in Redis
    await add_key_value_redis(
        f'hubspot_credentials:{org_id}:{user_id}', 
        json.dumps(response.json()), 
        expire=600
    )
    
    # Return HTML that closes the OAuth popup window
    close_window_script = """
    <html>
        <script>
            window.close();
        </script>
    </html>
    """
    return HTMLResponse(content=close_window_script)

async def get_hubspot_credentials(user_id, org_id):
    """
    Retrieve stored HubSpot credentials from Redis
    """
    credentials = await get_value_redis(f'hubspot_credentials:{org_id}:{user_id}')
    
    if not credentials:
        raise HTTPException(status_code=400, detail='No credentials found.')
    
    credentials = json.loads(credentials)
    
    if 'access_token' not in credentials:
        raise HTTPException(status_code=400, detail='Invalid credentials.')
    
    return credentials

async def get_items_hubspot(credentials):
    """
    Fetch contacts, companies, and deals from HubSpot and return as IntegrationItem objects
    """
    credentials = json.loads(credentials)
    access_token = credentials.get('access_token')
    items = []
    
    async with httpx.AsyncClient() as client:
        # Fetch contacts
        try:
            contacts_response = await client.get(
                'https://api.hubapi.com/crm/v3/objects/contacts',
                headers={'Authorization': f'Bearer {access_token}'},
                params={'limit': 100}
            )
            contacts_data = contacts_response.json()
            
            for contact in contacts_data.get('results', []):
                properties = contact.get('properties', {})
                item = IntegrationItem(
                    id=contact.get('id'),
                    type='contact',
                    name=f"{properties.get('firstname', '')} {properties.get('lastname', '')}".strip() or 'Unnamed Contact',
                    url=f"https://app.hubspot.com/contacts/{contact.get('id')}",
                    creation_time=properties.get('createdate'),
                    last_modified_time=properties.get('lastmodifieddate')
                )
                items.append(item.__dict__)
                print(f"Contact: {item.name} (ID: {item.id})")
        except Exception as e:
            print(f"Error fetching contacts: {e}")
        
        # Fetch companies
        try:
            companies_response = await client.get(
                'https://api.hubapi.com/crm/v3/objects/companies',
                headers={'Authorization': f'Bearer {access_token}'},
                params={'limit': 100}
            )
            companies_data = companies_response.json()
            
            for company in companies_data.get('results', []):
                properties = company.get('properties', {})
                item = IntegrationItem(
                    id=company.get('id'),
                    type='company',
                    name=properties.get('name', 'Unnamed Company'),
                    url=f"https://app.hubspot.com/contacts/{company.get('id')}/company/{company.get('id')}",
                    creation_time=properties.get('createdate'),
                    last_modified_time=properties.get('hs_lastmodifieddate')
                )
                items.append(item.__dict__)
                print(f"Company: {item.name} (ID: {item.id})")
        except Exception as e:
            print(f"Error fetching companies: {e}")
        
        # Fetch deals
        try:
            deals_response = await client.get(
                'https://api.hubapi.com/crm/v3/objects/deals',
                headers={'Authorization': f'Bearer {access_token}'},
                params={'limit': 100}
            )
            deals_data = deals_response.json()
            
            for deal in deals_data.get('results', []):
                properties = deal.get('properties', {})
                item = IntegrationItem(
                    id=deal.get('id'),
                    type='deal',
                    name=properties.get('dealname', 'Unnamed Deal'),
                    url=f"https://app.hubspot.com/contacts/{deal.get('id')}/deal/{deal.get('id')}",
                    creation_time=properties.get('createdate'),
                    last_modified_time=properties.get('hs_lastmodifieddate')
                )
                items.append(item.__dict__)
                print(f"Deal: {item.name} (ID: {item.id})")
        except Exception as e:
            print(f"Error fetching deals: {e}")
    
    return items
