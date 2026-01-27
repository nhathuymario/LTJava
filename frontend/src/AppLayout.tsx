import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header";
import NavCrumbBar from "./components/NavCrumbBar";
import { getRoles } from "./services/auth";
import { roleHomeMap } from "./utils/roleHome";
import { buildCrumbs } from "./utils/breadcrumb";


function AppLayout() {
    const location = useLocation();
    const roles = getRoles?.() || [];

    const home =
        roleHomeMap?.[roles[0]] ||
        roleHomeMap?.[`ROLE_${roles[0]}`] ||
        "/";

    return (
        <>
            <Header />

            <div className="lec-container" style={{ marginTop: 8 }}>
                <NavCrumbBar
                    sticky
                    items={buildCrumbs(location.pathname, home)}
                />
            </div>

            <Outlet />
        </>
    );
}

export default AppLayout;
