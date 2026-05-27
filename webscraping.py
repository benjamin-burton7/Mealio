import requests
import re
import json
import sys
from datetime import date
from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import urlparse


def _current_week() -> str:
    return f"V{date.today().isocalendar()[1]}"


DAYS = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag"]

ENGLISH_TO_SWEDISH_DAYS = {
    "Monday": "Måndag",
    "Tuesday": "Tisdag",
    "Wednesday": "Onsdag",
    "Thursday": "Torsdag",
    "Friday": "Fredag",
}

CATEGORIES = ["Green", "Local", "World Wide", "PIZZA", "Asia", "World"]

INTENDIT_PATTERN = re.compile(
    r"^(GREEN|LOCAL|WORLD WIDE|PIZZA|World Wide)(\d+):-\s*(.+)$",
    re.IGNORECASE,
)

INSPIRA_PATTERN = re.compile(
    r"(Green|Local|Asia|World)\s*\|\s*([^|]+)",
    re.IGNORECASE,
)


def empty_menu(week: str = "?") -> dict:
    return {
        "week": week,
        "days": {day: [] for day in DAYS},
    }


def _fetch(url: str) -> BeautifulSoup:
    headers = {"User-Agent": "Mozilla/5.0 (compatible; MenuBot/1.0)"}
    resp = requests.get(url, headers=headers, timeout=10)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "html.parser")


def _visible_text(soup: BeautifulSoup) -> str:
    for tag in soup(["script", "style", "noscript", "svg"]):
        tag.decompose()

    text = soup.get_text(separator="\n", strip=True)
    text = re.sub(r"\n{2,}", "\n", text)
    return text


def _is_day(line: str) -> bool:
    return line.strip().lower() in [day.lower() for day in DAYS]


def _normalize_day(line: str) -> str | None:
    for day in DAYS:
        if line.strip().lower() == day.lower():
            return day
    return None


def _is_category(line: str) -> bool:
    return line.strip().lower() in [category.lower() for category in CATEGORIES]


def _normalize_category(line: str) -> str:
    line = line.strip()

    if line.lower() == "world wide":
        return "World Wide"

    return line.title()


def scrape_line_based_category_menu(url: str) -> dict:
    """
    Works for Edison-style pages:

    Vecka 20
    Måndag
    Green
    115:-
    Dish text
    Local
    115:-
    Dish text
    World Wide
    115:-
    Dish text
    """
    soup = _fetch(url)
    text = _visible_text(soup)

    week_m = re.search(r"Vecka\s*\d+|VECKA\s*\d+|V\s*\d+", text, re.IGNORECASE)
    week = week_m.group(0).strip() if week_m else "?"

    menu = empty_menu(week)
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    current_day = None
    i = 0

    while i < len(lines):
        line = lines[i]
        day = _normalize_day(line)

        if day:
            current_day = day
            i += 1
            continue

        if current_day and _is_category(line):
            category = _normalize_category(line)
            price = None
            dish = None

            price_m = re.match(r"(\d+\s*:-)", lines[i + 1]) if i + 1 < len(lines) else None
            if price_m:
                price = price_m.group(1).replace(" ", "")
                if i + 2 < len(lines):
                    next_line = lines[i + 2]

                    if not _is_day(next_line) and not _is_category(next_line):
                        dish = next_line.strip()
                        i += 3
                    else:
                        i += 2
                else:
                    i += 2
            else:
                i += 1

            if dish:
                menu["days"][current_day].append(
                    {
                        "category": category,
                        "price": price,
                        "dish": dish,
                    }
                )

            continue

        i += 1

    return menu


def scrape_nordrest_menu(url: str) -> dict:
    soup = _fetch(url)
    text = _visible_text(soup)

    week_m = re.search(r"Lunch\s+(?:v\.?|w\.?)\s*(\d+)", text, re.IGNORECASE)
    week = f"V{week_m.group(1)}" if week_m else _current_week()

    menu = empty_menu(week)

    today_price_m = re.search(r"Todays lunch\s*:?\s*(\d+)\s*SEK", text, re.IGNORECASE)
    default_price = f"{today_price_m.group(1)}:-" if today_price_m else "105:-"

    weekly_price_m = re.search(r"Weekly dish\s*:?\s*(\d+)\s*SEK", text, re.IGNORECASE)
    weekly_price = f"{weekly_price_m.group(1)}:-" if weekly_price_m else "125:-"

    lines = [line.strip() for line in text.splitlines() if line.strip()]

    day_aliases = {
        "Monday": "Måndag",
        "Tuesday": "Tisdag",
        "Wednesday": "Onsdag",
        "Thursday": "Torsdag",
        "Friday": "Fredag",
        "Måndag": "Måndag",
        "Tisdag": "Tisdag",
        "Onsdag": "Onsdag",
        "Torsdag": "Torsdag",
        "Fredag": "Fredag",
    }

    allergen_words = {
        "Gluten",
        "Eggs",
        "Fish",
        "Mustard",
        "Soya",
        "Nuts",
        "Lactose",
        "Milk protein",
        "Celery",
        "Pork",
        "Beef",
        "Sesame",
        "Crustaceans",
        "Shellfish",
        "Peanuts",
        "Almonds",
        "Molluscs",
    }

    skip_patterns = [
        r"^Menu$",
        r"^PRICES?$",
        r"^PRISER$",
        r"^Lunch\s+(?:v\.?|w\.?)\s*\d+",
        r"Weekly dish\s*:",
        r"Todays lunch\s*:",
        r"Saladsbuffé",
        r"bread and water",
        r"Enjoy a daily",
        r"^Dishes of the week$",
        r"^Dish of the week$",
        r"^Veckans rätter$",
        r"^Veckans rätt$",
        r"^Welcome\.?$",
    ]

    stop_patterns = [
        r"^Klimato$",
        r"^Take away$",
        r"^Conference$",
        r"^Opening hours",
        r"^Contact$",
        r"^Book",
        r"^Subscribe",
    ]

    def normalize_nordrest_day(line: str) -> str | None:
        cleaned = line.strip()
        cleaned = re.sub(r"\s+(Today|Idag)$", "", cleaned, flags=re.IGNORECASE).strip()

        for source_day, swedish_day in day_aliases.items():
            if cleaned.lower() == source_day.lower():
                return swedish_day

        return None

    def is_allergen_line(line: str) -> bool:
        parts = [part.strip() for part in line.split("•") if part.strip()]

        if not parts:
            return False

        return all(part in allergen_words for part in parts)

    def should_skip_line(line: str) -> bool:
        return any(re.search(pattern, line, re.IGNORECASE) for pattern in skip_patterns)

    def should_stop(line: str) -> bool:
        return any(re.search(pattern, line, re.IGNORECASE) for pattern in stop_patterns)

    def looks_like_climate_label(line: str) -> bool:
        return bool(re.fullmatch(r"[A-E]\s*\d+[,.]\d+", line.strip(), re.IGNORECASE))

    current_day = None
    current_title = None
    current_description_parts = []

    def save_current_item():
        nonlocal current_title, current_description_parts

        if not current_day or not current_title:
            current_title = None
            current_description_parts = []
            return

        description = " ".join(current_description_parts).strip()
        dish = current_title.strip()

        if description:
            dish = f"{dish} - {description}"

        lower_dish = dish.lower()
        price = weekly_price if "burger" in lower_dish or "salmon" in lower_dish else default_price

        menu["days"][current_day].append(
            {
                "category": "Lunch",
                "price": price,
                "dish": dish,
            }
        )

        current_title = None
        current_description_parts = []

    try:
        start_index = next(
            i
            for i, line in enumerate(lines)
            if re.search(r"Lunch\s+(?:v\.?|w\.?)\s*\d+", line, re.IGNORECASE)
        )
    except StopIteration:
        start_index = 0

    for line in lines[start_index:]:
        day = normalize_nordrest_day(line)

        if day:
            save_current_item()
            current_day = day
            continue

        if current_day is None:
            continue

        if should_stop(line):
            save_current_item()
            break

        if should_skip_line(line):
            continue

        if looks_like_climate_label(line):
            continue

        if is_allergen_line(line):
            save_current_item()
            continue

        if current_title is None:
            current_title = line
        else:
            current_description_parts.append(line)

    save_current_item()

    return menu


def scrape_intendit_menu(url: str) -> dict:
    soup = _fetch(url)
    text = _visible_text(soup)

    week_m = re.search(r"(V\s*\d+|VECKA\s*\d+|Vecka\s*\d+)", text, re.IGNORECASE)
    week = week_m.group(1).strip() if week_m else "?"

    menu = empty_menu(week)

    # First try Edison-style line based parsing.
    line_based = scrape_line_based_category_menu(url)
    if any(len(items) > 0 for items in line_based["days"].values()):
        return line_based

    for day in DAYS:
        heading = soup.find(string=re.compile(rf"\b{day}\b", re.IGNORECASE))

        if not heading:
            continue

        items = []
        node = heading.parent

        while node and len(items) < 5:
            node = node.find_next_sibling()

            if not node:
                break

            text = node.get_text(separator=" ", strip=True)
            m = INTENDIT_PATTERN.search(text)

            if m:
                items.append(
                    {
                        "category": m.group(1).title(),
                        "price": f"{m.group(2)}:-",
                        "dish": m.group(3).strip(),
                    }
                )

        menu["days"][day] = items

    return menu


def scrape_inspira_menu(url: str) -> dict:
    soup = _fetch(url)
    text = _visible_text(soup)

    week_m = re.search(r"vecka\s*(\d+)", text, re.IGNORECASE)
    week = f"vecka {week_m.group(1)}" if week_m else "?"

    menu = empty_menu(week)

    day_re = re.compile(
        r"^\s*(Måndag|Tisdag|Onsdag|Torsdag|Fredag)\s*$",
        re.IGNORECASE | re.MULTILINE,
    )
    parts = day_re.split(text)

    for i in range(1, len(parts) - 1, 2):
        raw_day = parts[i].strip()
        content = parts[i + 1]

        day = next((d for d in DAYS if raw_day.lower() == d.lower()), None)
        if not day:
            continue

        lines = [line.strip() for line in content.splitlines() if line.strip()]

        if not any(re.match(r"(Green|Local|Asia|World)\s*\|", line, re.IGNORECASE) for line in lines):
            continue

        items = []
        j = 0
        while j < len(lines):
            m = re.match(r"(Green|Local|Asia|World)\s*\|\s*(.+)", lines[j], re.IGNORECASE)
            if m:
                category = m.group(1).title()
                dish = m.group(2).strip()

                if j + 1 < len(lines):
                    next_line = lines[j + 1]
                    if (
                        not re.match(r"(Green|Local|Asia|World)\s*\|", next_line, re.IGNORECASE)
                        and not _is_day(next_line)
                    ):
                        dish = f"{dish}, {next_line}"
                        j += 1

                items.append(
                    {
                        "category": category,
                        "dish": dish,
                    }
                )

            j += 1

        menu["days"][day] = items

    return menu


def scrape_smakapakina_menu(url: str) -> dict:
    soup = _fetch(url)
    page_text = _visible_text(soup)

    week = _current_week()

    menu = empty_menu(week)

    day_re = re.compile(
        r"(Måndag|Tisdag|Onsdag|Torsdag|Fredag),?\s*\d+\s+\w+",
        re.IGNORECASE,
    )

    parts = day_re.split(page_text)

    for i in range(1, len(parts) - 1, 2):
        raw_day = parts[i].strip()
        content = parts[i + 1] if i + 1 < len(parts) else ""

        day = next((d for d in DAYS if raw_day.lower().startswith(d.lower())), None)

        if not day:
            continue

        price_m = re.search(r"(\d+)[\s\xa0]*kr", content)
        price = f"{price_m.group(1)}:-" if price_m else "110:-"

        lunch_block = re.split(r"\d+[\s\xa0]*kr", content, maxsplit=1)[0]

        items = []

        for m in re.finditer(r"\d+\.+\s*(.+?)(?=\d+\.|$)", lunch_block, re.DOTALL):
            dish = re.sub(r"\s+", " ", m.group(1)).strip()
            dish = re.sub(r"\s*[\uff08(][^)\uff09]*[)\uff09]", "", dish).strip()
            dish = re.sub(r"[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+", "", dish).strip()
            dish = re.sub(r"\s+", " ", dish).strip()

            if dish and len(dish) > 2:
                items.append(
                    {
                        "category": "Lunch",
                        "price": price,
                        "dish": dish,
                    }
                )

        menu["days"][day] = items

    return menu


def scrape_laziza_menu(url: str) -> dict:
    soup = _fetch(url)
    text = _visible_text(soup)

    price_m = re.search(r"(\d+)\s*kr", text)
    price = f"{price_m.group(1)}:-" if price_m else "145:-"

    menu = empty_menu("static")

    for day in DAYS:
        menu["days"][day] = [
            {
                "category": "Buffé",
                "price": price,
                "dish": "Libanesisk lunchbuffé, varm & kall meze, sallader och röror",
            }
        ]

    return menu


def scrape_matochmat_menu(url: str) -> dict:
    soup = _fetch(url)
    text = _visible_text(soup)

    week_m = re.search(r"VECKA\s*(\d+)", text, re.IGNORECASE)
    week = f"V{week_m.group(1)}" if week_m else "?"

    menu = empty_menu(week)

    day_heading = re.compile(
        r"(Måndag|Tisdag|Onsdag|Torsdag|Fredag)\s*\d+/\d+",
        re.IGNORECASE,
    )

    item_re = re.compile(
        r"([^\n]{4,80})\n(\d{2,3})\nkr\n([^\n]+)",
        re.IGNORECASE,
    )

    parts = day_heading.split(text)

    for i in range(1, len(parts) - 1, 2):
        raw_day = parts[i].strip()
        content = parts[i + 1] if i + 1 < len(parts) else ""

        day = next((d for d in DAYS if raw_day.lower().startswith(d.lower())), None)

        if not day:
            continue

        items = []

        for m in item_re.finditer(content):
            name = re.sub(r"\s+", " ", m.group(1)).strip()
            desc = re.sub(r"\s+", " ", m.group(3)).strip()
            price = f"{m.group(2)}:-"
            full_dish = f"{name}, {desc}" if desc else name

            if name and len(name) > 3:
                items.append(
                    {
                        "category": "Lunch",
                        "price": price,
                        "dish": full_dish,
                    }
                )

        menu["days"][day] = items

    return menu


def scrape_saladsandsmoothies_menu(url: str) -> dict:
    soup = _fetch(url)
    text = _visible_text(soup)

    items = []

    item_re = re.compile(
        r"([A-Z][A-Z &()\-]{3,60})\n.{10,200}?\n\s*(\d+(?:/\d+)?)\s*KR",
        re.DOTALL,
    )

    for m in item_re.finditer(text):
        name = m.group(1).strip()
        price_str = m.group(2).split("/")[-1]

        if name and len(name) > 3:
            items.append(
                {
                    "category": "Meny",
                    "price": f"{price_str}:-",
                    "dish": name.title(),
                }
            )

    menu = empty_menu("static")

    for day in DAYS:
        menu["days"][day] = items

    return menu


def _detect_scraper(url: str):
    domain = urlparse(url).netloc.lower()

    if "nordrest.se" in domain:
        return scrape_nordrest_menu

    if "restaurangedison.se" in domain:
        return scrape_line_based_category_menu

    if "brickseatery.se" in domain:
        return scrape_line_based_category_menu

    if "laziza.se" in domain:
        return scrape_laziza_menu

    if "smakapakina.se" in domain:
        return scrape_smakapakina_menu

    if "restauranginspira.se" in domain:
        return scrape_inspira_menu

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
    url = sys.argv[2]

    try:
        data = _detect_scraper(url)(url)
    except requests.exceptions.RequestException as e:
        print(f"Error fetching URL: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error scraping menu: {e}")
        sys.exit(1)

    solution_root = Path(__file__).resolve().parent
    output_dir = solution_root / "Mealio.Server" / "Data" / "Menus"
    output_dir.mkdir(parents=True, exist_ok=True)

    out = output_dir / f"menu_{name}.json"

    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Saved {out}")