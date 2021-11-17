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
import { ETDContext } from "../../pages/model/ETDProvider";

type Props = {};

export function BlockTimeHistoryDisplay(props: Props) {
  const { history } = React.useContext(ETDContext);

  return (
    <ResponsiveContainer width="100%" height="80%">
      <BarChart width={150} height={40} data={history?.blockTimeHistory}>
        <XAxis domain={[50, 50]} axisLine={false} />
        <YAxis domain={["dataMin - 1", "dataMax + 1"]} axisLine={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="blockTime" fill="#8884d8" isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
