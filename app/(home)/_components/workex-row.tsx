import { workexs } from "@/lib/workex";
import { WorkExCard } from "./workex-card";

export const WorkExRow = () => {
  return (
    <>
      <div>
        <div className="font-semibold text-lg mt-8">Work Experience</div>
        <div className="grid grid-cols-1 gap-4">
          {workexs.map((workex) => (
            <WorkExCard workex={workex} key={workex.id} />
          ))}
        </div>
      </div>
    </>
  );
};
