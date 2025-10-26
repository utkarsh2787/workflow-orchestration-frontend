"use client";

import { store } from "@/store";
import { Provider } from "react-redux";
import { Dashboard } from "../components/dashboard";



export default function DashboardPage() {


    return (
        <Provider store={store}>
            <Dashboard />
        </Provider>
    );
}
