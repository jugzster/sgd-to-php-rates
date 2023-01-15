# For more information, please refer to https://aka.ms/vscode-docker-python
FROM python:3.10

WORKDIR /app

# Install pip requirements
COPY requirements.txt .
RUN python -m pip install --no-cache-dir -r requirements.txt
RUN playwright install
RUN playwright install-deps

COPY . /app

# During debugging, this entry point will be overridden. For more information, please refer to https://aka.ms/vscode-docker-python-debug
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]