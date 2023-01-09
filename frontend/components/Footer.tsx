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
    <div className="text-center text-gray-900 dark:text-gray-100">
      <p className="font-bold hover:underline decoration-yellow-400 mb-4">
        <a href="mailto:hey@sgdtopeso.com">
          Want better rates for your remittances? Let us know!
        </a>
      </p>
      <p className="text-sm">Last updated: {lastUpdated}</p>
    </div>
  );
};

export default Footer;
