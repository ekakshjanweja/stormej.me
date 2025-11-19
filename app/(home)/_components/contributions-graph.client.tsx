"use client";

import {
  type Activity,
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
  ContributionGraphFooter,
  ContributionGraphLegend,
  ContributionGraphTotalCount,
} from "@/components/kibo-ui/contribution-graph";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

type ContributionsGraphClientProps = {
  data: Activity[];
  total: number;
  year: number;
};

export const ContributionsGraphClient = ({
  data,
  total,
  year,
}: ContributionsGraphClientProps) => {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card/60 p-4 text-sm text-muted-foreground">
        Contribution data is taking a breather—try again shortly.
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={100}>
      <ContributionGraph
        data={data}
        totalCount={total}
        className={cn("contribution-grid text-[11px] text-muted-foreground")}
      >
        <ContributionGraphCalendar className="custom-scrollbar mt-4 max-w-full overflow-x-auto pb-2">
          {({ activity, dayIndex, weekIndex }) => (
            <Tooltip key={`${activity.date}-${weekIndex}-${dayIndex}`}>
              <TooltipTrigger asChild>
                <g>
                  <ContributionGraphBlock
                    activity={activity}
                    dayIndex={dayIndex}
                    weekIndex={weekIndex}
                    className={cn(
                      "cursor-pointer transition-opacity hover:opacity-90"
                    )}
                  />
                </g>
              </TooltipTrigger>
              <TooltipContent className="text-xs">
                {activity.count === 0 ? "No" : activity.count} contribution
                {activity.count === 1 ? "" : "s"} on{" "}
                {format(parseISO(activity.date), "MMMM d, yyyy")}
              </TooltipContent>
            </Tooltip>
          )}
        </ContributionGraphCalendar>
        <ContributionGraphFooter className="flex items-center justify-between text-[11px] text-muted-foreground">
          <ContributionGraphTotalCount>
            {({ totalCount }) => (
              <span>
                {totalCount.toLocaleString()} contributions in {year}
              </span>
            )}
          </ContributionGraphTotalCount>
          <ContributionGraphLegend>
            {({ level }) => (
              <div
                className={cn("legend-block h-3 w-3 rounded-sm")}
                data-level={level}
              />
            )}
          </ContributionGraphLegend>
        </ContributionGraphFooter>
      </ContributionGraph>
    </TooltipProvider>
  );
};
