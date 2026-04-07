FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PIP_DEFAULT_TIMEOUT=180
ENV PIP_RETRIES=12

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    g++ \
    libexpat1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN set -eux; \
        for attempt in 1 2 3; do \
            pip install --no-cache-dir -r /app/requirements.txt && break; \
            echo "pip install failed on attempt ${attempt}; retrying..."; \
            if [ "${attempt}" -eq 3 ]; then exit 1; fi; \
            sleep $((attempt * 15)); \
        done

COPY app /app/app
COPY tests /app/tests

RUN mkdir -p /app/models /app/bootstrap-model && \
    python app/train_model.py --output /app/bootstrap-model/xgb_model.json

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000
CMD ["/entrypoint.sh"]
