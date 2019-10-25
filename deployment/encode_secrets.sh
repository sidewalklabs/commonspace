DB_HOST=
DB_USER=
DB_PASS=
DB_NAME=
SQL_INSTANCE_CONNECTION_NAME=
SERVER_HOSTNAME=
JWT_SECRET=
GOOGLE_AUTH_CLIENT_ID=
GOOGLE_AUTH_CLIENT_SECRET=
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_APP_ID=
FIREBASE_SERVICE_ACCOUNT_KEY=
echo "DB_HOST: $(echo -n "$DB_HOST" | openssl base64 -A)"
echo "DB_USER: $(echo -n "$DB_USER"  | openssl base64 -A)"
echo "DB_PASS: $(echo -n "$DB_PASS"  | openssl base64 -A)"
echo "DB_NAME: $(echo -n "$DB_NAME"  | openssl base64 -A)"
echo "DB_PORT: $(echo -n "5432"  | openssl base64 -A)"
echo "JWT_SECRET: $(echo -n "$JWT_SECRET"  | openssl base64 -A)"
echo "SERVER_HOSTNAME: $(echo -n "$SERVER_HOSTNAME"  | openssl base64 -A)"
echo "GOOGLE_AUTH_CLIENT_ID: $(echo -n "$GOOGLE_AUTH_CLIENT_ID" | openssl base64 -A)"
echo "GOOGLE_AUTH_CLIENT_SECRET: $(echo -n "$GOOGLE_AUTH_CLIENT_SECRET" | openssl base64 -A)"
echo "FIREBASE_API_KEY: $(echo -n "$FIREBASE_API_KEY" | openssl base64 -A)"
echo "FIREBASE_AUTH_DOMAIN: $(echo -n "$FIREBASE_AUTH_DOMAIN" | openssl base64 -A)"
echo "FIREBASE_PROJECT_ID: $(echo -n "$FIREBASE_PROJECT_ID" | openssl base64 -A)"
echo "FIREBASE_APP_ID: $(echo -n "$FIREBASE_APP_ID" | openssl base64 -A)"
echo "FIREBASE_SERVICE_ACCOUNT_KEY: $(echo -n "$FIREBASE_SERVICE_ACCOUNT_KEY" | openssl base64 -A)"
echo "SQL_INSTANCE_CONNECTION_NAME: $(echo -n "$SQL_INSTANCE_CONNECTION_NAME" | openssl base64 -A)"
