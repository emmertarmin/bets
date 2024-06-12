# README

## Dev setup and run
```
cd www
yarn install
yarn dev
```

## renew certs:
```sh
docker compose run --rm  certbot certonly --webroot --webroot-path /var/www/certbot/ --dry-run -d bets.emmert.hu
```