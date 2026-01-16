import { Outlet } from "react-router-dom"
import Header from "./components/Header"

function AppLayout() {
    return (
        <>
            <Header />
            <Outlet />
        </>
    )
}

export default AppLayout
