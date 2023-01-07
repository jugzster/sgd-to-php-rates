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
  const utcNow = new Date().toUTCString();
  const lastUpdated = updatedOnUtc.from(utcNow);

  return (
    <div className="text-center text-sm text-gray-500">
      <p>Last updated: {lastUpdated}</p>
    </div>
  );
};

export default Footer;
