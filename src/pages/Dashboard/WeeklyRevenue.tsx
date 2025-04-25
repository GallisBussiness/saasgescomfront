import { PropsWithChildren, ReactNode } from "react";
import Card from "../../components/card";

type Props =  PropsWithChildren<{
  add: ReactNode;
}>;


export const WeeklyRevenue = ({add,children}: Props) => {
  return (
    <Card extra="flex flex-col bg-white w-full rounded-3xl py-6 px-2 text-center">
      <div className="mb-auto flex items-center justify-between px-6">
        {add}
      </div>

      <div className="md:mt-16 lg:mt-0">
        <div className="h-[350px] w-full xl:h-[430px]">
         {children}
        </div>
      </div>
    </Card>
  );
};
