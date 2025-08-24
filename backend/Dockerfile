# From https://github.com/lfvvercosa/example_playwright_lambda/blob/main/container/Dockerfile
# Define Lambda function directory
ARG FUNCTION_DIR="/function"

# Official Playwright image
FROM mcr.microsoft.com/playwright/python:v1.54.0-jammy as build-image

# Install aws-lambda-cpp build dependencies
RUN apt-get update && \
  apt-get install -y \
  g++ \
  make \
  cmake \
  unzip \
  libcurl4-openssl-dev \
  software-properties-common \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  pciutils \
  xdg-utils

# Include global arg in this stage of the build
ARG FUNCTION_DIR

# Put function code in the specified directory
RUN mkdir -p ${FUNCTION_DIR}

# Install the function's dependencies - Lambda runtime interface client
RUN pip install --target ${FUNCTION_DIR} awslambdaric

# Install required packages
COPY requirements.txt .
RUN pip install --target ${FUNCTION_DIR} -r requirements.txt

# Copy function code
COPY . ${FUNCTION_DIR}

# Multi-stage build: grab a fresh copy of the base image
FROM mcr.microsoft.com/playwright/python:v1.54.0-jammy

# Include global arg in this stage of the build
ARG FUNCTION_DIR
# Set working directory to function root directory
WORKDIR ${FUNCTION_DIR}

# Copy in the built dependencies
COPY --from=build-image ${FUNCTION_DIR} ${FUNCTION_DIR}

# Set runtime interface client as default command for the container runtime
ENTRYPOINT [ "python", "-m", "awslambdaric" ]
# Pass the name of the function handler as an argument to the runtime
CMD [ "lambda_handler.handler" ]

# Local testing only. Uncomment below lines, comment above ENTRYPOINT and CMD
# RUN pip install uvicorn

# ENTRYPOINT ["uvicorn"]
# CMD ["main:app", "--host", "0.0.0.0", "--port", "8069"]