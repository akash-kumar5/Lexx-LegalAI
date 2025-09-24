# Use a slim Python base
FROM python:3.11-slim

# Install system deps required by pdfplumber, docx, etc.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      build-essential \
      libpoppler-cpp-dev \
      pkg-config \
      poppler-utils && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /server

# Copy and install Python deps (cached layer)
COPY requirements.txt /server/requirements.txt
RUN pip install --no-cache-dir -r /server/requirements.txt

# Copy app code
COPY . /server/

# Recommended runtime envs
ENV PORT=8080
ENV PYTHONUNBUFFERED=1

# Document the port
EXPOSE 8080

# Use the PORT env var if provided by the platform
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]
