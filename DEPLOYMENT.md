# ASTER Landing Page - Digital Ocean Deployment Guide

## Prerequisites

- Docker installed on your local machine
- Digital Ocean account
- Domain name (optional but recommended)

## Local Testing

Before deploying, test the Docker build locally:

```bash
# Build the Docker image
docker build -t aster-landing .

# Run the container locally
docker run -p 8080:80 aster-landing

# Or use docker-compose
docker-compose up --build
```

Visit `http://localhost:8080` to verify the application works.

## Digital Ocean Deployment Options

### Option 1: Digital Ocean App Platform (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add Docker configuration"
   git push origin main
   ```

2. **Create App in Digital Ocean**
   - Go to [Digital Ocean App Platform](https://cloud.digitalocean.com/apps)
   - Click "Create App"
   - Connect your GitHub repository
   - Select the `aster-landing` directory
   - Choose "Docker" as the source type
   - Set environment variables if needed
   - Deploy

### Option 2: Digital Ocean Droplet with Docker

1. **Create a Droplet**
   - Choose Ubuntu 22.04 LTS
   - Select size based on your needs (Basic $6/month is sufficient)
   - Choose a datacenter region close to your users
   - Add your SSH key

2. **Connect to your Droplet**
   ```bash
   ssh root@your-droplet-ip
   ```

3. **Install Docker**
   ```bash
   # Update system
   apt update && apt upgrade -y
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Add user to docker group
   usermod -aG docker $USER
   ```

4. **Deploy your application**
   ```bash
   # Clone your repository
   git clone https://github.com/your-username/ASTER-Australian-Robotics.git
   cd ASTER-Australian-Robotics/aster-landing
   
   # Build and run
   docker build -t aster-landing .
   docker run -d -p 80:80 --name aster-landing aster-landing
   ```

5. **Set up Nginx reverse proxy (optional)**
   ```bash
   apt install nginx -y
   
   # Configure nginx
   cat > /etc/nginx/sites-available/aster-landing << 'EOF'
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:80;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   EOF
   
   # Enable site
   ln -s /etc/nginx/sites-available/aster-landing /etc/nginx/sites-enabled/
   nginx -t && systemctl reload nginx
   ```

### Option 3: Digital Ocean Container Registry

1. **Create Container Registry**
   - Go to [Digital Ocean Container Registry](https://cloud.digitalocean.com/registry)
   - Create a new registry

2. **Build and push image**
   ```bash
   # Tag your image
   docker tag aster-landing registry.digitalocean.com/your-registry/aster-landing:latest
   
   # Push to registry
   docker push registry.digitalocean.com/your-registry/aster-landing:latest
   ```

3. **Deploy from registry**
   - Use the image URL in your deployment configuration
   - Update the image tag when you want to deploy new versions

## Environment Variables

Create a `.env` file for environment-specific configuration:

```bash
NODE_ENV=production
API_URL=https://your-api-domain.com
```

## SSL/HTTPS Setup

### Using Let's Encrypt with Certbot

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d your-domain.com

# Auto-renewal
crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Using Traefik (if using docker-compose)

The provided `docker-compose.yml` includes Traefik labels for automatic SSL. Make sure to:

1. Update the host rule in `docker-compose.yml`
2. Set up Traefik with Let's Encrypt resolver
3. Configure your domain's DNS to point to your droplet

## Monitoring and Maintenance

### Health Checks

The application includes a health check endpoint at `/health` that returns "healthy" when the service is running.

### Logs

```bash
# View container logs
docker logs aster-landing

# Follow logs in real-time
docker logs -f aster-landing
```

### Updates

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up --build -d
```

## Performance Optimization

The Dockerfile and nginx configuration include:

- Gzip compression for text-based assets
- Long-term caching for static assets
- Security headers
- Angular SPA routing support
- Health check endpoint

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using port 80
   netstat -tulpn | grep :80
   
   # Stop conflicting service
   systemctl stop nginx  # if nginx is running
   ```

2. **Permission denied**
   ```bash
   # Fix Docker permissions
   sudo chmod 666 /var/run/docker.sock
   ```

3. **Build fails**
   ```bash
   # Clear Docker cache
   docker system prune -a
   
   # Check Dockerfile syntax
   docker build --no-cache .
   ```

### Support

For additional help:
- Check Docker logs: `docker logs aster-landing`
- Verify nginx configuration: `nginx -t`
- Test connectivity: `curl -I http://localhost/health`
