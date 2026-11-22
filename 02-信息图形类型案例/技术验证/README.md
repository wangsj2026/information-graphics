# 读图复算

样本取自公开图版的标注或图例，转录方式见各条案例。

| 验证对象 | 检验方法 | 图版 |
| --- | --- | --- |
| 环形时间比例 | 从图上读出地球、月球形成标注并换算夹角。 | [案例图与出处](../01-%E7%BC%96%E5%B9%B4%E5%9E%8B%E4%BF%A1%E6%81%AF%E5%9B%BE%E5%BD%A2/02-geologic-clock.md) |
| 双变量矩阵 | 组合 1–3 的等级并查验格号，缺失记录走斜线分支。 | [案例图与出处](../05-%E5%9C%B0%E7%90%86%E5%9B%BE%E5%BD%A2%E4%BF%A1%E6%81%AF%E5%9B%BE%E5%BD%A2/02-bivariate-screening-map.md) |
| 流线带宽 | 按图例把人数转为带宽并比较两端人数。 | [案例图与出处](../06-%E6%B7%B7%E5%90%88%E5%9E%8B%E4%BF%A1%E6%81%AF%E5%9B%BE%E5%BD%A2/01-minard-russia-campaign.md) |
| 得票率及席位 | 计算得票率差并比较席位。 | [案例图与出处](../06-%E6%B7%B7%E5%90%88%E5%9E%8B%E4%BF%A1%E6%81%AF%E5%9B%BE%E5%BD%A2/02-estonia-election-charts.md) |
| 仪器功能矩阵 | 统计光谱仪符号覆盖的仪器组。 | [案例图与出处](../07-%E6%96%87%E5%AD%97%E5%9E%8B%E4%B8%8E%E5%88%97%E8%A1%A8%E5%9E%8B%E4%BF%A1%E6%81%AF%E5%9B%BE%E5%BD%A2/02-webb-instrument-functions.md) |
| 任务时间戳 | 把三个任务事件换成秒数并求相邻间隔。 | [案例图与出处](../08-%E6%97%B6%E9%97%B4%E8%BD%B4%E5%9E%8B%E4%BF%A1%E6%81%AF%E5%9B%BE%E5%BD%A2/01-artemis-i-ascent.md) |
| 普查历史时间轴 | 查验两个连续年份区间的实际跨度。 | [案例图与出处](../08-%E6%97%B6%E9%97%B4%E8%BD%B4%E5%9E%8B%E4%BF%A1%E6%81%AF%E5%9B%BE%E5%BD%A2/02-census-privacy-timeline.md) |

## 运行方法

进入本目录，使用 Python 3.8 或更新版本运行 `python verify.py`。脚本只使用标准库。

源文件为 [observations.json](observations.json) 和 [verify.py](verify.py)。

## 本版运行输出

```text
地质时钟：23 Ma，对应理论角度 1.82°
双变量地图：Charleston → 9
双变量地图：Florence → 3
双变量地图：Cherokee → 缺失（斜线）
米纳尔：起点 42.2 mm，末端 1.0 mm，人数比 2.37%
选举图：Isamaa 与 SDE 的得票率相差 2.2 个百分点，席位 2:2
韦布仪器：有光谱仪图标的标注为 4/4 组
阿耳忒弥斯一号：任务秒数 [132, 500, 510]，相邻间隔 [368, 10] 秒
人口普查时间轴：抽取节点间隔 [50, 10] 年
```
