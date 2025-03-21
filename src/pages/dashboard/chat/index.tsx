import React from "react";

import { FadeInSlide } from "~/components/animation/fadeInSlide";
import { DashboardLayout } from "~/components/layout/DashboardLayout"; 
import { api } from "~/utils/api";

export default function Chat() {
  return (
    <DashboardLayout title="Chat">
      <FadeInSlide>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-[100vh] flex-1 rounded-xl  md:min-h-min items-start justify-start flex">
            <div className="flex flex-col gap-4 p-4 pt-10 md:w-full">
              <div className="flex flex-row justify-between items-start gap-4">
                <h1 className="text-2xl font-semibold">
                    Chat
                  <br />
                  <span className="text-base font-normal text-gray-500">
                        Chat with our Red Horse Team to deploy new changes rapidly!
                  </span>
                </h1>
              </div>
              <hr />
              <div className="flex flex-col gap-4 rounded-xl p-4 items-center justify-center">
                <p>Chat functionality coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </FadeInSlide>
    </DashboardLayout>
  );
}