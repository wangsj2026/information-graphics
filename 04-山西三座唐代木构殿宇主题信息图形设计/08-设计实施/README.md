# 08 · 设计实施

- [初始版式草图](01-%E8%8D%89%E5%9B%BE%E4%B8%8E%E4%BD%8E%E4%BF%9D%E7%9C%9F/%E7%89%88%E5%BC%8F%E8%8D%89%E5%9B%BE.png)
- [图版迭代与数值核对](02-%E8%AE%BE%E8%AE%A1%E8%BF%AD%E4%BB%A3/README.md)
- [最终成图 PNG](03-%E6%9C%80%E7%BB%88%E4%BA%A4%E4%BB%98/%E5%B1%B1%E8%A5%BF%E4%B8%89%E5%BA%A7%E5%94%90%E4%BB%A3%E6%9C%A8%E6%9E%84%E6%AE%BF%E5%AE%87.png)
- [可编辑 HTML 图版](03-%E6%9C%80%E7%BB%88%E4%BA%A4%E4%BB%98/%E5%9B%BE%E7%89%88.html)
- [图形绘制脚本](03-%E6%9C%80%E7%BB%88%E4%BA%A4%E4%BB%98/%E5%9B%BE%E5%BD%A2%E7%BB%98%E5%88%B6.js)
- [项目数据同步脚本](render.py)

成图 3200 × 4704 像素，由浏览器按 2 倍像素密度导出。下载后以浏览器打开 HTML，拖动拆层距离滑杆可观察轴测层间关系。保留 HTML、JS 与 `assets` 的相对路径。修改 CSV 后，在本目录运行 `python render.py`，同步嵌入数据后重新打开图版。打开图版时在地址末尾加 `?print=1` 可隐藏滑杆，便于导出图像。
