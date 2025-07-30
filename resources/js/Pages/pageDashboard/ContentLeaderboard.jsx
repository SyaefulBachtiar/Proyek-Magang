import { Head, usePage } from "@inertiajs/react";
import Dashboard, {DashboardState} from "../Dashboard";
import { useEffect, useState } from "react";


export default function ContentLeaderboard() {
  return (
    <Dashboard>
      <Head title="Leaderboard"/>
      <Leaderboard />
    </Dashboard>
  );
}



function Leaderboard() {
    // Props dari controller
        const { activePage } = usePage().props;
    
        // Dashboard state
        const { setActivePage } = DashboardState();
    
        useEffect(() => {
            if(activePage && setActivePage){
                setActivePage(activePage);
            }
        }, [activePage]);
    return (
        <></>
    )
}