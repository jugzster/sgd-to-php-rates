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
      <p className="font-bold hover:underline decoration-yellow-400 decoration-2 mb-8">
        <a href="mailto:hey@sgdtopeso.com">
          Want to include a remittance center? <br />
          Or better exchange rates? Let us know!
        </a>
      </p>
      <p className="text-sm">Last updated {lastUpdated}</p>
      <p className="text-xs mt-8 text-gray-500">
        <a
          target="_blank"
          rel="noreferrer"
          href="https://www.flaticon.com/free-icons/peso"
          title="peso icons"
        >
          Icon by HAJICON - Flaticon
        </a>
      </p>
    </div>
  );
};

export default Footer;
