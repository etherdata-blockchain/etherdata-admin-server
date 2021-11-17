// @flow
import * as React from "react";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  rewards: { date: string; reward: number }[];
};

export function RewardDisplay(props: Props) {
  return (
    <ResponsiveContainer width="100%" height="80%">
      <BarChart width={150} height={40} data={props.rewards}>
        <XAxis domain={[50, 50]} axisLine={false} dataKey={"date"} />
        <YAxis domain={["dataMin - 100", "dataMax"]} axisLine={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="reward" fill="#8884d8" isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
