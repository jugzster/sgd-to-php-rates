import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";
import { Status } from "../lib/status";

type LastUpdatedProps = {
  status: Status;
};

const LastUpdated = ({ status }: LastUpdatedProps) => {
  dayjs.extend(utc);
  dayjs.extend(relativeTime);
  const updatedOnUtc = dayjs.utc(status.updatedOn);
  const utcNow = dayjs.utc();
  const lastUpdated = updatedOnUtc.from(utcNow);

  return (
    <div className="mt-10">
      <p className="text-sm">As of {lastUpdated}</p>
    </div>
  );
};

export default LastUpdated;
