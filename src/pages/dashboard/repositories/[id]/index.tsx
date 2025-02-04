import { DashboardLayout } from "~/components/layout/DashboardLayout"; 

import { api } from "~/utils/api";

export default function Home(){   
  return (
    <DashboardLayout title="Homes"> 
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div> 
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min"> 
          <div>Repo {"/repositories/id"} </div>;
        </div>
      </div>
    </DashboardLayout>
  );
}; 