import React from "react";

export default function FourOFour() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="min-h-[100vh] flex-1 rounded-xl  md:min-h-min items-start justify-center flex">
        <div className="flex flex-col gap-4 p-4 pt-10 md:w-1/2">
          <div className="flex flex-row justify-between items-start gap-4">
            <h1 className="text-2xl font-semibold">
                404
              <br />
              <span className="text-base font-normal text-gray-500">
                    Page Not Found
              </span>
            </h1>
          </div>
          <hr />
          <div className="flex flex-col gap-4 border border-secondary rounded-xl p-4">
            <h2>Page Not Found</h2>
            <hr />
            <div className="flex flex-col bg-secondary rounded-xl p-4 gap-4 justify-center items-center">
              <p className="text-gray-400">
                    The page you are looking for does not exist.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};