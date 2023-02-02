# email-tagging-service

Generate a password from https://security.google.com/settings/security/apppasswords and use that password instead

ADD .env file

EMAIL= Your Gmail Id
PASSWORD= Your password generated from above link
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

Run Server Commands

Build Container

docker build -t 'container name in lowercase' .

Run Container

docker run -it 'container name in lowercase' // to see logs
docker run -d 'container name in lowercase' // to run in detached mode