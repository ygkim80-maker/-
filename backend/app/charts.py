"""외부 차트 라이브러리 없이 대시보드용 인라인 SVG 막대/선 차트를 생성합니다.

dataviz 스킬 가이드를 따릅니다: 얇은 마크, 4px 라운드 처리, 2px 그리드라인,
단일 시리즈는 범례 없이 direct label, 팔레트는 references/palette.md 값 사용.
"""

SERIES_BLUE = "#2a78d6"
MUTED = "#898781"
GRID = "#e1e0d9"
BASELINE = "#c3c2b7"
TEXT_SECONDARY = "#52514e"
TEXT_PRIMARY = "#0b0b0b"


def bar_chart(labels: list[str], values: list[float], *, unit: str = "", height: int = 220, bar_color: str = SERIES_BLUE) -> str:
    if not values:
        return "<p class='muted'>데이터가 없습니다.</p>"
    n = len(values)
    max_val = max(values) or 1
    bar_w = 56
    gap = 24
    width = n * bar_w + (n - 1) * gap + 60
    chart_top = 20
    chart_bottom = height - 36
    plot_h = chart_bottom - chart_top

    svg = [f"<svg viewBox='0 0 {width} {height}' width='100%' class='chart-svg' role='img' aria-label='막대 차트'>"]

    # gridlines (4 horizontal guides)
    for i in range(4):
        y = chart_top + plot_h * i / 3
        svg.append(f"<line x1='30' y1='{y:.1f}' x2='{width - 10}' y2='{y:.1f}' stroke='{GRID}' stroke-width='1'/>")

    for idx, (label, val) in enumerate(zip(labels, values)):
        x = 30 + idx * (bar_w + gap)
        bar_h = plot_h * (val / max_val)
        y = chart_bottom - bar_h
        svg.append(
            f"<rect x='{x:.1f}' y='{y:.1f}' width='{bar_w}' height='{max(bar_h, 2):.1f}' "
            f"rx='4' ry='4' fill='{bar_color}'/>"
        )
        value_label = f"{val:g}{unit}"
        svg.append(
            f"<text x='{x + bar_w / 2:.1f}' y='{y - 8:.1f}' text-anchor='middle' "
            f"font-size='13' fill='{TEXT_PRIMARY}' font-weight='600'>{value_label}</text>"
        )
        svg.append(
            f"<text x='{x + bar_w / 2:.1f}' y='{chart_bottom + 18}' text-anchor='middle' "
            f"font-size='12' fill='{MUTED}'>{label}</text>"
        )

    svg.append(f"<line x1='30' y1='{chart_bottom}' x2='{width - 10}' y2='{chart_bottom}' stroke='{BASELINE}' stroke-width='1'/>")
    svg.append("</svg>")
    return "".join(svg)


def line_chart(labels: list[str], values: list[float], *, unit: str = "", height: int = 220) -> str:
    if not values:
        return "<p class='muted'>데이터가 없습니다.</p>"
    n = len(values)
    max_val = max(values) or 1
    width = max(n * 70, 300)
    chart_top = 20
    chart_bottom = height - 36
    plot_h = chart_bottom - chart_top
    plot_w = width - 60

    def point(i, v):
        x = 30 + (plot_w * i / (n - 1) if n > 1 else plot_w / 2)
        y = chart_bottom - plot_h * (v / max_val)
        return x, y

    svg = [f"<svg viewBox='0 0 {width} {height}' width='100%' class='chart-svg' role='img' aria-label='선 차트'>"]
    for i in range(4):
        y = chart_top + plot_h * i / 3
        svg.append(f"<line x1='30' y1='{y:.1f}' x2='{width - 10}' y2='{y:.1f}' stroke='{GRID}' stroke-width='1'/>")

    pts = [point(i, v) for i, v in enumerate(values)]
    path = " ".join(f"{'M' if i == 0 else 'L'}{x:.1f},{y:.1f}" for i, (x, y) in enumerate(pts))
    svg.append(f"<path d='{path}' fill='none' stroke='{SERIES_BLUE}' stroke-width='2'/>")

    for (x, y), label, val in zip(pts, labels, values):
        svg.append(f"<circle cx='{x:.1f}' cy='{y:.1f}' r='4' fill='{SERIES_BLUE}'/>")
        svg.append(
            f"<text x='{x:.1f}' y='{y - 10:.1f}' text-anchor='middle' font-size='12' "
            f"fill='{TEXT_PRIMARY}'>{val:g}{unit}</text>"
        )
        svg.append(
            f"<text x='{x:.1f}' y='{chart_bottom + 18}' text-anchor='middle' font-size='11' "
            f"fill='{MUTED}'>{label}</text>"
        )
    svg.append(f"<line x1='30' y1='{chart_bottom}' x2='{width - 10}' y2='{chart_bottom}' stroke='{BASELINE}' stroke-width='1'/>")
    svg.append("</svg>")
    return "".join(svg)
