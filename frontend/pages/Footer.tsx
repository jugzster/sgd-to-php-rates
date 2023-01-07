import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/utc";
import utc from "dayjs/plugin/relativeTime";
import { Status } from "../lib/status";

type FooterProps = {
  status: Status;
};

const Footer = ({ status }: FooterProps) => {
  dayjs.extend(relativeTime);
  dayjs.extend(utc);

  const updatedOnUtc = dayjs.utc(status.updated_on);
  const lastUpdated = updatedOnUtc.from(new Date());

  return (
    <div className="text-center text-sm mt-4 text-gray-500">
      Last updated: <span>{lastUpdated}</span>
    </div>
  );
};

export default Footer;
