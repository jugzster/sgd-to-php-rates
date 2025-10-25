import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

type MidRateProps = {
  midRate: number;
};

const singaporeTime = dayjs().tz("Asia/Singapore");

const MidRate = ({ midRate }: MidRateProps) => {
  return (
    <div className="text-center font-semibold mt-8 mb-4 h-14">
      <p className="text-slate-400">{singaporeTime.format("DD MMM YYYY")}</p>
      <p className="text-xl hover:text-2xl font-bold duration-200">
        1 SGD = {midRate} PHP
      </p>
    </div>
  );
};

export default MidRate;
