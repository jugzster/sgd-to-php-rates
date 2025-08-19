## Setup

1. Create virtual environment
   `python -m venv venv`
   This creates a new venv
2. Activate the virtual environment.
   In Windows:
   `venv\Scripts\Activate.ps1`
   If there is PSSecurityException, set execution policy:
   `Set-ExecutionPolicy RemoteSigned`
3. Install packages from requirements.txt
   `pip install -r requirements.txt`
4. Confirm installed packages
   `pip list`
5. Install Playwright
   `playwright install`

## To run locally as web service:

`uvicorn main:app`

## Docker

### Build

docker build -t sgd-to-php-rates .
Old:
docker build --secret id=\_env,src=.env -t sgd-to-php-rates .

### Run with env file

docker run -d --rm --env-file=.env --name sgd-to-php-rates-instance -p 8069:8069 sgd-to-php-rates

## Playwright

Playwright code generator

1. Run command: playwright codegen [website]
2. New browser window and Inspector Window will open. Every navigation is recorded as Playwright code and shown in the Inspector.

Example:
playwright codegen https://sg.metroremit.com/
