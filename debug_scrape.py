import requests
from bs4 import BeautifulSoup
import re
import sys


def main():
    if len(sys.argv) < 2:
        print("Usage: python debug_scrape.py <url>")
        sys.exit(1)

    url = sys.argv[1]

    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; MenuBot/1.0)"
    }

    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    # Remove junk that often pollutes scraped text.
    for tag in soup(["script", "style", "noscript", "svg"]):
        tag.decompose()

    text = soup.get_text(separator="\n", strip=True)
    text = re.sub(r"\n{2,}", "\n", text)

    print(text)


if __name__ == "__main__":
    main()