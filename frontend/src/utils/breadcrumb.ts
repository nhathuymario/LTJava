type Crumb = { label: string; to?: string };

export function buildCrumbs(pathname: string, home: string): Crumb[] {
    const parts = pathname.split("/").filter(Boolean);

    const crumbs: Crumb[] = [{ label: "Trang chủ", to: home }];

    let acc = "";
    for (const p of parts) {
        acc += `/${p}`;

        // ✅ bỏ qua id số (16, 123...)
        if (/^\d+$/.test(p)) continue;

        const label = decodeURIComponent(p).replace(/-/g, " ");
        crumbs.push({ label, to: acc });
    }

    return crumbs;
}
