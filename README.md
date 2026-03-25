# IONOS Dynamic DNS Client

A lightweight Node.js client for automatically updating IONOS DNS records with your current public IP address.

## Overview

This script provides a simple Dynamic DNS (DDNS) solution for IONOS DNS hosting. It fetches your current public IP and updates specified A records to point to it.

## Features

- **IP Detection**: Automatically fetches your public IP via ipify.org
- **Multi-domain Support**: Handles multiple domains and subdomains
- **IONOS API Integration**: Direct integration with IONOS DNS API v1
- **Atomic Updates**: Updates all configured records in a single execution

## Prerequisites

- Node.js v18+ (native `fetch` API required)
- IONOS API Key with DNS permissions
- Active IONOS DNS hosting subscription

## Configuration

### 1. API Key Setup

Obtain your API key from the [IONOS Control Panel](https://api.ionos.com/docs/).

### 2. Edit `main.js`

```javascript
let API_KEY = "YOUR_IONOS_API_KEY"  // Replace with your actual API key

let apis = [
  new IonosAPI(API_KEY, "yourdomain.com", [
    "www",        // www.yourdomain.com
    "subdomain",  // subdomain.yourdomain.com
    "api"         // api.yourdomain.com
  ]),
].map(el => el.updateAll());
```

## Usage

### One-time Execution

```bash
node main.js
```

### Cron Job (Recommended)

For continuous IP synchronization, configure a cron job:

```bash
# Every 5 minutes
*/5 * * * * /usr/bin/node /path/to/ionos-dyndns/main.js >> /var/log/ddns.log 2>&1
```

### Systemd Timer (Alternative)

Create `/etc/systemd/system/ionos-ddns.service`:

```ini
[Unit]
Description=IONOS Dynamic DNS Update

[Service]
Type=oneshot
ExecStart=/usr/bin/node /path/to/ionos-dyndns/main.js

[Install]
WantedBy=multi-user.target
```

Create `/etc/systemd/system/ionos-ddns.timer`:

```ini
[Unit]
Description=Run IONOS DDNS update every 5 minutes

[Timer]
OnBootSec=1min
OnUnitActiveSec=5min

[Install]
WantedBy=timers.target
```

Enable:

```bash
sudo systemctl enable --now ionos-ddns.timer
```

## API Reference

### Class: `IonosAPI`

| Method | Description |
|--------|-------------|
| `constructor(apiKey, zone, subdomains)` | Initialize with API key, zone name, and subdomain array |
| `fetchMyIp()` | Returns current public IP address |
| `fetchZoneId()` | Retrieves IONOS zone ID for configured domain |
| `fetchRecords()` | Fetches all A records for configured subdomains |
| `updateAll()` | Updates all configured records with current IP |

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/dns/v1/zones/` | GET | List all DNS zones |
| `/dns/v1/zones/{zoneId}` | GET | Get zone records |
| `/dns/v1/zones/{zoneId}/records/{recordId}` | PUT | Update specific record |

## Error Handling

- **Zone not found**: Returns `-1` from `fetchZoneId()`
- **API errors**: HTTP status codes logged to console
- **Network errors**: Unhandled promise rejection (Node.js default)

## TTL Configuration

Default TTL is set to 60 seconds for near-real-time propagation. Modify in `main.js`:

```javascript
body: JSON.stringify({
  "disabled": false,
  "content": my_ip,
  "ttl": 60,    // Adjust TTL here
  "prio": 0
})
```

## Security Considerations

- Store API keys securely (environment variables recommended for production)
- API key requires DNS modification permissions only
- No sensitive data stored locally

## Dependencies

**Zero external dependencies.** Uses native Node.js APIs:

- `fetch` (global)
- `console` (logging)

## License

MIT

## Author

Generated for IONOS Dynamic DNS management
