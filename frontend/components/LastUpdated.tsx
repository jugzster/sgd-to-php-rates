import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/utc";
import utc from "dayjs/plugin/relativeTime";
import { Status } from "../lib/status";

type LastUpdatedProps = {
  status: Status;
};

const LastUpdated = ({ status }: LastUpdatedProps) => {
  dayjs.extend(relativeTime);
  dayjs.extend(utc);
  const updatedOnUtc = dayjs.utc(status.updatedOn);
  const utcNow = new Date().toUTCString();
  const lastUpdated = updatedOnUtc.from(utcNow);

  return (
    <div className="mt-10">
      <p className="text-sm">Last updated {lastUpdated}</p>
    </div>
  );
};

export default LastUpdated;
