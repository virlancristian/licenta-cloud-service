#!/bin/sh

# Wait for MySQL to be ready
echo "Waiting for MySQL..."

until nc -z mysql 3306; do
  sleep 1
done

echo "MySQL is up - continuing..."
exec "$@"
