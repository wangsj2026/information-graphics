"""Recalculate selected figure readings with Python 3.8+."""
from decimal import Decimal
import json
from pathlib import Path

BASE = Path(__file__).resolve().parent
data = json.loads((BASE / "observations.json").read_text(encoding="utf-8"))

def mission_seconds(timestamp):
    hours, minutes, seconds = map(int, timestamp.split(":"))
    return hours * 3600 + minutes * 60 + seconds

def grid_code(access, use):
    if access is None or use is None:
        return "缺失（斜线）"
    if access not in (1, 2, 3) or use not in (1, 2, 3):
        raise ValueError("图例等级需要为 1、2 或 3。")
    return str((access - 1) * 3 + use)

clock = data["clock"]
elapsed_ma = clock["earth_ma"] - clock["moon_ma"]
angle = elapsed_ma / clock["earth_ma"] * 360
print(f"地质时钟：{elapsed_ma} Ma，对应理论角度 {angle:.2f}°")

for county, access, use in data["bivariate"]:
    print(f"双变量地图：{county} → {grid_code(access, use)}")

campaign = data["minard"]
start, end = campaign["start_people"], campaign["end_people"]
scale = campaign["people_per_mm"]
print(f"米纳尔：起点 {start / scale:.1f} mm，末端 {end / scale:.1f} mm，人数比 {end / start:.2%}")

(first, first_share, first_seats), (second, second_share, second_seats) = data["election"]
gap = Decimal(str(first_share)) - Decimal(str(second_share))
print(f"选举图：{first} 与 {second} 的得票率相差 {gap:.1f} 个百分点，席位 {first_seats}:{second_seats}")

spectrographs = sum(row[2] > 0 for row in data["webb"])
print(f"韦布仪器：有光谱仪图标的标注为 {spectrographs}/{len(data['webb'])} 组")

event_seconds = [mission_seconds(time) for _, time in data["artemis"]]
time_gaps = [right - left for left, right in zip(event_seconds, event_seconds[1:])]
print(f"阿耳忒弥斯一号：任务秒数 {event_seconds}，相邻间隔 {time_gaps} 秒")

years = data["census"]
year_gaps = [right - left for left, right in zip(years, years[1:])]
print(f"人口普查时间轴：抽取节点间隔 {year_gaps} 年")
