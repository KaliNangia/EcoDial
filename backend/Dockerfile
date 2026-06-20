FROM python:3.11-slim

WORKDIR /backend

# Copy dependency configuration and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source application
COPY app/ app/

EXPOSE 8000

# Run FastAPI app with Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
