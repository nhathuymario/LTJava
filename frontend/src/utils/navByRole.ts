import type {NavigateFunction} from "react-router-dom";
import { getRoles } from "../services/auth";
import { roleHomeMap } from "./roleHome";

export function goHomeByRole(nav: NavigateFunction) {
    const roles = getRoles() || [];
    for (const r of roles) {
        if (roleHomeMap[r]) {
            nav(roleHomeMap[r]);
            return;
        }
    }
    nav("/"); // fallback: chưa login
}
