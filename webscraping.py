import requests
import re
import json
import sys
from bs4 import BeautifulSoup
from urllib.parse import urlparse

DAYS = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag"]

# Intendit CMS: CATEGORY PRICE:- Dish
INTENDIT_PATTERN = re.compile(
    r"^(GREEN|LOCAL|WORLD WIDE|PIZZA|World Wide)(\d+):-\s*(.+)$", re.IGNORECASE
)
# Inspira: Category | Dish description
INSPIRA_PATTERN = re.compile(r"(Green|Local|Asia|World)\s*\|\s*([^|]+)", re.IGNORECASE)

# DOwnloads da webpage returns in parsed html obj
def _fetch(url: str) -> BeautifulSoup:
    headers = {"User-Agent": "Mozilla/5.0 (compatible; MenuBot/1.0)"}
    resp = requests.get(url, headers=headers, timeout=10)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "html.parser")


def scrape_intendit_menu(url: str) -> dict:
    soup = _fetch(url)
    week_tag = soup.find(string=re.compile(r"V\s*\d+|VECKA\s*\d+", re.IGNORECASE))
    week = week_tag.strip() if week_tag else "?"

    menu = {"week": week, "days": {}}
    for day in DAYS:
        heading = soup.find(string=re.compile(rf"\b{day}\b", re.IGNORECASE))
        if not heading:
            continue
        items, node = [], heading.parent
        while node and len(items) < 5:
            node = node.find_next_sibling()
            if node:
                text = node.get_text(separator=" ", strip=True)
                m = INTENDIT_PATTERN.search(text)
                if m:
                    items.append({
                        "category": m.group(1).title(),
                        "price": f"{m.group(2)}:-",
                        "dish": m.group(3).strip(),
                    })
        menu["days"][day] = items
    return menu


def scrape_inspira_menu(url: str) -> dict:
    soup = _fetch(url)
    week_tag = soup.find(string=re.compile(r"VECKA\s*\d+", re.IGNORECASE))
    week = week_tag.strip() if week_tag else "?"    

    menu = {"week": week, "days": {}}
    for day in DAYS:
        heading = soup.find(string=re.compile(rf"\b{day}\b", re.IGNORECASE))
        if not heading:
            continue
        block_text = ""
        node = heading.parent
        while True:
            node = node.find_next_sibling()
            if not node:
                break
            text = node.get_text(separator=" ", strip=True)
            if any(re.search(rf"\b{d}\b", text, re.IGNORECASE) for d in DAYS if d != day):
                break
            block_text += " " + text
        items = [
            {"category": m.group(1).title(), "dish": m.group(2).strip().rstrip("|").strip()}
            for m in INSPIRA_PATTERN.finditer(block_text)
        ]
        menu["days"][day] = items
    return menu


def scrape_smakapakina_menu(url: str) -> dict:
    soup = _fetch(url)
    page_text = soup.get_text(separator="\n")

    week_m = re.search(r"(V\s*\d+|VECKA\s*\d+)", page_text, re.IGNORECASE)
    week = week_m.group(1).strip() if week_m else "?"

    menu = {"week": week, "days": {}}
    day_re = re.compile(
        r"(Måndag|Tisdag|Onsdag|Torsdag|Fredag),?\s*\d+\s+\w+", re.IGNORECASE
    )
    parts = day_re.split(page_text)
    for i in range(1, len(parts) - 1, 2):
        raw_day = parts[i].strip()
        content = parts[i + 1] if i + 1 < len(parts) else ""
        day = next((d for d in DAYS if raw_day.lower().startswith(d.lower())), None)
        if not day:
            continue
        price_m = re.search(r"(\d+)\s*kr", content)
        price = f"{price_m.group(1)}:-" if price_m else "110:-"
        items = []
        for m in re.finditer(r"\d+\.\s+(.+?)(?=\d+\.|$)", content, re.DOTALL):
            dish = re.sub(r"\s+", " ", m.group(1)).strip()
            dish = re.sub(r"\s*\d+\s*kr\s*$", "", dish).strip()
            dish = re.sub(r"\s*[\u4e00-\u9fff\uff08\uff09()]+\s*", " ", dish).strip()
            if dish:
                items.append({"category": "Lunch", "price": price, "dish": dish})
        menu["days"][day] = items
    return menu


def scrape_laziza_menu(url: str) -> dict:
    soup = _fetch(url)
    price_m = re.search(r"(\d+)\s*kr", soup.get_text())
    price = f"{price_m.group(1)}:-" if price_m else "145:-"
    menu = {"week": "static", "days": {}}
    for day in DAYS:
        menu["days"][day] = [{
            "category": "Buffé",
            "price": price,
            "dish": "Libanesisk lunchbuffé, varm & kall meze, sallader och röror",
        }]
    return menu


def scrape_troppo_menu(url: str) -> dict:
    soup = _fetch(url)
    text = soup.get_text(separator="\n")

    week_m = re.search(r"Week\s+(\d+)", text, re.IGNORECASE)
    week = f"V{week_m.group(1)}" if week_m else "?"

    price_m = re.search(r"(\d{3})(?:-\d+)?\s*kr", text, re.IGNORECASE)
    price = f"{price_m.group(1)}:-" if price_m else "149:-"

    # Items are separated by standalone "or" lines
    mf_m = re.search(r"Monday.Friday(.+?)(?:Find us|open Hours|$)", text, re.DOTALL | re.IGNORECASE)
    items = []
    if mf_m:
        blocks = re.split(r"\n\s*or\s*\n", mf_m.group(1))
        for block in blocks:
            lines = [l.strip() for l in block.split("\n") if l.strip()]
            if lines:
                name = re.sub(r"[\u200d\u200b\u200c\ufeff]", "", lines[0]).strip()
                if name and len(name) > 3:
                    items.append({"category": "Lunch", "price": price, "dish": name})

    menu = {"week": week, "days": {}}
    for day in DAYS:
        menu["days"][day] = items
    return menu


def scrape_matochmat_menu(url: str) -> dict:
    """Scraper for any single page restaurant"""
    soup = _fetch(url)
    text = soup.get_text(separator="\n")

    week_m = re.search(r"VECKA\s*(\d+)", text, re.IGNORECASE)
    week = f"V{week_m.group(1)}" if week_m else "?"

    # Day headings on matochmat look like "Måndag11/5" or "Måndag 11/5"
    DAY_HEADING = re.compile(
        r"(M\u00e5ndag|Tisdag|Onsdag|Torsdag|Fredag)\s*\d+/\d+", re.IGNORECASE
    )
    # Items: DishName (no space) PRICE kr description
    ITEM_RE = re.compile(
        r"([A-Za-z\u00c0-\u00ff&'\- ]{4,80?}?)(\d{2,3})\s*kr\s*(.+?)(?=[A-Z\u00c5\u00c4\u00d6][a-z]|\Z)",
        re.DOTALL,
    )

    parts = DAY_HEADING.split(text)
    menu = {"week": week, "days": {}}
    for i in range(1, len(parts) - 1, 2):
        raw_day = parts[i].strip()
        content = parts[i + 1] if i + 1 < len(parts) else ""
        day = next((d for d in DAYS if raw_day.lower().startswith(d.lower())), None)
        if not day:
            continue
        items = []
        for m in ITEM_RE.finditer(content):
            dish = re.sub(r"\s+", " ", m.group(1)).strip()
            price = f"{m.group(2)}:-"
            if dish and len(dish) > 3:
                items.append({"category": "Lunch", "price": price, "dish": dish})
        menu["days"][day] = items
    return menu


def scrape_saladsandsmoothies_menu(url: str) -> dict:
    """Salads and Smoothies - fixed menu, same every day"""
    soup = _fetch(url)
    text = soup.get_text(separator="\n")

    items = []
    ITEM_RE = re.compile(
        r"([A-Z][A-Z &()\-]{3,60})\n.{10,200}?\n\s*(\d+(?:/\d+)?)\s*KR",
        re.DOTALL,
    )
    for m in ITEM_RE.finditer(text):
        name = m.group(1).strip()
        price_str = m.group(2).split("/")[-1]  # Use higher price if range
        if name and len(name) > 3:
            items.append({"category": "Meny", "price": f"{price_str}:-", "dish": name.title()})

    menu = {"week": "static", "days": {}}
    for day in DAYS:
        menu["days"][day] = items
    return menu


def _detect_scraper(url: str):
    domain = urlparse(url).netloc.lower()
    path = urlparse(url).path.lower()
    if "laziza.se" in domain:
        return scrape_laziza_menu
    if "smakapakina.se" in domain:
        return scrape_smakapakina_menu
    if "restauranginspira.se" in domain:
        return scrape_inspira_menu
    if "troppo.se" in domain:
        return scrape_troppo_menu
    if "saladsandsmoothies.se" in domain:
        return scrape_saladsandsmoothies_menu
    if "matochmat.se" in domain:
        return scrape_matochmat_menu
    return scrape_intendit_menu


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python webscraping.py <name> <url>")
        sys.exit(1)
    name = sys.argv[1]
    url  = sys.argv[2]
    try:
        data = _detect_scraper(url)(url)
    except requests.exceptions.RequestException as e:
        print(f"Error fetching URL: {e}")
        sys.exit(1)
    out = f"menu_{name}.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Saved {out}")