"""Synchronize the infographic's embedded data from the project CSV files."""
import csv
import json
import re
from pathlib import Path

STAGE = Path(__file__).resolve().parent
ROOT = STAGE.parent
DELIVERY = STAGE / "03-最终交付"
DATA = ROOT / "04-基础数据集构建" / "01-规范化数据表" / "山西唐代木构.csv"
PHOTOS = ROOT / "03-数据搜集" / "02-文本文献" / "照片溯源.csv"
PLATE = DELIVERY / "图版.html"

with DATA.open(newline="", encoding="utf-8-sig") as file:
    halls = list(csv.DictReader(file))
with PHOTOS.open(newline="", encoding="utf-8-sig") as file:
    media = {record["building_id"]: record for record in csv.DictReader(file)}

assert len(halls) == len(media) == 3
assert {hall["building_id"] for hall in halls} == media.keys()
for hall in halls:
    for key in ("year_ce", "front_bays", "depth_bays", "bracket_puzuo", "horizontal_jumps", "angled_jumps"):
        hall[key] = int(hall[key])
    for key in ("bracket_to_column", "roof_to_column"):
        hall[key] = float(hall[key]) if hall[key] else None
    hall["photo"] = media[hall["building_id"]]["photo"]
    assert (DELIVERY / hall["photo"]).is_file()
    assert 780 <= hall["year_ce"] <= 860
    assert 1 <= hall["front_bays"] <= 7 and 1 <= hall["depth_bays"] <= 4

halls.sort(key=lambda hall: hall["year_ce"])
assert len({hall["year_ce"] for hall in halls}) == 3
payload = json.dumps(halls, ensure_ascii=False).replace("<", "\\u003c")
template = PLATE.read_text(encoding="utf-8")
updated, count = re.subn(
    r'(<script id="hall-data" type="application/json">).*?(</script>)',
    lambda match: match[1] + payload + match[2],
    template,
    count=1,
    flags=re.S,
)
assert count == 1
PLATE.write_text(updated, encoding="utf-8")
print(PLATE)

