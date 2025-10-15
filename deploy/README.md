# Deploy — My Portfolio (Ubuntu + Nginx + systemd)

This folder contains example configuration files and a step-by-step guide to deploy the portfolio on an Ubuntu server.

Files included
- `nginx-portfolio.conf` — example Nginx server block (uses Let's Encrypt cert paths).
- `my-portfolio-backend.service` — systemd unit for the Node backend (runs as `www-data` by default).

Important: You uploaded a PEM file to this workspace. You indicated this PEM should be used as an SSH key (not a TLS key). Follow the steps below to use that PEM to copy files and SSH into the server.

Replace `example.com` with your real domain.

## 1) Prepare the server

On the Ubuntu server run:

    sudo apt update
    sudo apt install -y nginx git nodejs npm certbot python3-certbot-nginx

## 2) Use the PEM as SSH key (from your local machine)

On your local machine (PowerShell example):

    # scp the repo or site files to the server (example)
    scp -i C:\path\to\myportfolio2025.pem -r "C:\path\to\site\*" ubuntu@example.com:/home/ubuntu/site-temp/
    ssh -i C:\path\to\myportfolio2025.pem ubuntu@example.com

then on the server move files into /var/www:

    sudo mkdir -p /var/www/my-portfolio
    sudo mv /home/ubuntu/site-temp/* /var/www/my-portfolio/
    sudo chown -R www-data:www-data /var/www/my-portfolio

## 3) Install backend and create systemd service

Clone or copy your backend to /opt/my-portfolio/backend and install dependencies:

    sudo mkdir -p /opt/my-portfolio
    sudo chown $USER:$USER /opt/my-portfolio
    cd /opt/my-portfolio
    git clone https://github.com/<your-username>/My-Portfolio-2025.git backend
    cd backend
    npm install --production
    sudo chown -R www-data:www-data /opt/my-portfolio/backend

Install the systemd unit (from this repo):

    sudo cp deploy/my-portfolio-backend.service /etc/systemd/system/my-portfolio-backend.service
    sudo systemctl daemon-reload
    sudo systemctl enable --now my-portfolio-backend.service
    sudo systemctl status my-portfolio-backend.service

## 4) Configure Nginx and enable HTTPS

Copy the example Nginx config to nginx sites-available, enable it and test:

    sudo cp deploy/nginx-portfolio.conf /etc/nginx/sites-available/my-portfolio
    sudo ln -s /etc/nginx/sites-available/my-portfolio /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl reload nginx

Get a trusted certificate from Let's Encrypt (recommended):

    sudo certbot --nginx -d example.com -d www.example.com

Certbot will update the Nginx config to use certificates from /etc/letsencrypt/live/example.com/ and set up automatic renewal.

## 5) Firewall

    sudo ufw allow OpenSSH
    sudo ufw allow 'Nginx Full'
    sudo ufw enable
    sudo ufw status

## 6) Test the deployment

From server:

    curl -I http://127.0.0.1:3000/api/ || true
    sudo journalctl -u my-portfolio-backend -f
    sudo tail -f /var/log/nginx/error.log

From your local machine:

    curl -Ik https://example.com

## 7) Notes & troubleshooting

- If you need to use a custom SSH user or different paths, edit the service and config files accordingly.
- Keep the PEM file secure; don't commit it to git or leave it in an unsecured location on the server.

---

If you want, I can also:
- Modify these example files to use a different service user.
- Add a small deployment script to automate steps (I recommend reviewing it before running).
