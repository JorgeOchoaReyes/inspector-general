import { DashboardLayout } from "~/components/layout/DashboardLayout"; 

import { api } from "~/utils/api";

export default function Home(){   
  return (
    <DashboardLayout title="Pull Request"> 
      <div className="flex flex-1 flex-row gap-4 p-4 pt-0"> 
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min"> 
        
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min"> 
        
        </div>
      </div>
    </DashboardLayout>
  );
};                 