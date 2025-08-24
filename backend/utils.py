def get_browser_launch_args():
    return [
        "--disable-gpu",
        "--single-process",
        "--disable-dev-shm-usage",
        "--no-zygote",
        "--disable-setuid-sandbox",
        "--no-sandbox",
    ]
