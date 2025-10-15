Deployment steps — Ubuntu (18.04/20.04/22.04)

1) Install nginx (if not installed)

   sudo apt update
   sudo apt install -y nginx

2) Copy project files to the server web root (example path used below)

   # on the server, choose a path (example: /var/www/my-portfolio)
   sudo mkdir -p /var/www/my-portfolio
   sudo chown $USER:$USER /var/www/my-portfolio

   # From your local machine, copy files (using scp) or git clone on the server:
   # Example using scp (from local):
   # scp -r ./* user@your-server:/var/www/my-portfolio/

   # Or on the server:
   # git clone https://github.com/<your-user>/My-Portfolio-2025.git /var/www/my-portfolio

3) Copy the nginx site config and enable it

   sudo cp deploy/nginx-portfolio.conf /etc/nginx/sites-available/my-portfolio
   sudo ln -s /etc/nginx/sites-available/my-portfolio /etc/nginx/sites-enabled/

   # Edit /etc/nginx/sites-available/my-portfolio and replace server_name and root

4) Test nginx config and reload

   sudo nginx -t
   sudo systemctl reload nginx

5) (Optional) Enable HTTPS with certbot

   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d example.com -d www.example.com

Notes
- Replace example.com with your domain or server IP.
- Make sure `portfolio.html` is present in the web root (it's set as the index in the config).
- If you run nginx behind a firewall, open port 80 (and 443 for HTTPS).

Docker + Caddy (automatic HTTPS)

This repository includes a simple Docker Compose setup that runs Caddy to serve the static site and automatically obtain TLS certificates.

1) Prepare the site folder in the `deploy` directory:

   mkdir -p deploy/site
   # Copy your static files into deploy/site (portfolio.html, styles.css, images, ...)

2) Edit `deploy/Caddyfile` and replace `example.com` with your domain.

3) On the server (Ubuntu), install Docker and Docker Compose if needed:

   sudo apt update
   sudo apt install -y docker.io docker-compose
   sudo systemctl enable --now docker

4) Start the stack from the project root:

   cd /path/to/My-Portfolio-2025
   docker compose -f deploy/docker-compose.yml up -d

5) Verify: visit https://your-domain and check that `portfolio.html` is served and TLS is active.

Notes:
- Caddy will attempt to obtain certificates from Let's Encrypt for the domain you specify. Make sure DNS points to the server and ports 80/443 are open.
- If you prefer to run behind nginx or another reverse proxy, configure Caddy accordingly or adjust the stack.
