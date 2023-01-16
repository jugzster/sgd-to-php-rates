# syntax = docker/dockerfile:1.2
# For more information, please refer to https://aka.ms/vscode-docker-python
FROM python:3.10

WORKDIR /app

# Load secret file, from https://render.com/docs/docker-secrets#secret-files-in-docker-builds
RUN echo "Hey: Mounting secrets file"
RUN --mount=type=secret,id=_env,dst=/etc/secrets/.env cat /etc/secrets/.env

# Install pip requirements
COPY requirements.txt .
RUN echo "Hey: Running pip install"
RUN python -m pip install --no-cache-dir -r requirements.txt
RUN echo "Hey: Running playwright install"
RUN playwright install
RUN echo "Hey: Running playwright install-deps"
RUN playwright install-deps

COPY . /app

# During debugging, this entry point will be overridden. For more information, please refer to https://aka.ms/vscode-docker-python-debug
RUN echo "Hey: Running CMD uvicorn"
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]