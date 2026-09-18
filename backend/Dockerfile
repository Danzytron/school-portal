FROM php:8.4-cli-alpine

# Install system dependencies & PostgreSQL driver
RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    oniguruma-dev

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql mbstring zip bcmath opcache

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy application files (since context is /backend)
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Set permissions
RUN chown -R www-data:www-data storage bootstrap/cache && \
    chmod -R 775 storage bootstrap/cache

EXPOSE 8000

CMD php artisan config:clear && \
    php artisan route:clear && \
    php artisan migrate --force && \
    php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
