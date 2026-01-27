import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export type Crumb = {
    label: string;
    to?: string;          // nếu có => click được
    onClick?: () => void; // ưu tiên hơn to nếu bạn muốn custom
};

type Props = {
    items?: Crumb[];       // truyền tay nếu muốn custom theo page
    homeLabel?: string;    // mặc định "Trang chủ"
    showBack?: boolean;    // có nút back không
    sticky?: boolean;      // dính top
};

const barStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 12,
    background: "#dff3f2", // giống ảnh
    color: "#667085",
    fontSize: 14,
};

const linkStyle: React.CSSProperties = {
    cursor: "pointer",
    color: "#667085",
    textDecoration: "none",
};

const sepStyle: React.CSSProperties = { opacity: 0.7 };

export default function NavCrumbBar({
                                        items,
                                        homeLabel = "Trang chủ",
                                        showBack = true,
                                        sticky = false,
                                    }: Props) {
    const nav = useNavigate();
    const loc = useLocation();

    // fallback: nếu không truyền items thì auto theo path (đơn giản)
    // fallback: nếu không truyền items thì auto theo path (đơn giản)
    const autoItems: Crumb[] = useMemo(() => {
        const parts = loc.pathname.split("/").filter(Boolean);
        if (parts.length === 0) return [{ label: homeLabel, to: "/" }];

        const crumbs: Crumb[] = [{ label: homeLabel, to: "/" }];

        let acc = "";
        for (const p of parts) {
            acc += `/${p}`;

            // ✅ BỎ QUA ID SỐ (vd: 16, 123)
            if (/^\d+$/.test(p)) continue;

            // ✅ label đẹp hơn
            const label = decodeURIComponent(p).replace(/-/g, " ");
            crumbs.push({ label, to: acc });
        }

        return crumbs;
    }, [loc.pathname, homeLabel]);


    const list = items?.length ? items : autoItems;

    const containerStyle: React.CSSProperties = sticky
        ? { position: "sticky", top: 0, zIndex: 50, paddingTop: 8 }
        : {};

    return (
        <div style={containerStyle}>
            <div style={barStyle}>
                {showBack && (
                    <span
                        style={{ ...linkStyle, fontWeight: 600 }}
                        onClick={() => nav(-1)}
                        title="Quay lại"
                    >
            ←
          </span>
                )}

                {list.map((c, idx) => {
                    const isLast = idx === list.length - 1;

                    const content = (
                        <span
                            style={{
                                ...linkStyle,
                                cursor: isLast ? "default" : "pointer",
                                fontWeight: isLast ? 600 : 400,
                            }}
                        >
              {c.label}
            </span>
                    );

                    return (
                        <span key={idx} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {idx > 0 && <span style={sepStyle}>•</span>}

                            {isLast ? (
                                content
                            ) : (
                                <span
                                    onClick={() => (c.onClick ? c.onClick() : c.to ? nav(c.to) : null)}
                                    style={linkStyle}
                                >
                  {c.label}
                </span>
                            )}
            </span>
                    );
                })}
            </div>
        </div>
    );
}
