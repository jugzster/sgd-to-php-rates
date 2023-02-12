import ThemeSwitch from "./ThemeSwitch";

const Header = () => {
  return (
    <header>
      <div className="flex justify-between w-96 px-2">
        <span className="text-sm hover:underline decoration-yellow-400 decoration-2">
          <a href="mailto:hey@sgdtopeso.com">Say Hi!</a>
        </span>
        <span>
          <ThemeSwitch />
        </span>
      </div>
      <div className="text-center text-3xl mt-8">
        <h1 className="font-bold underline">SGD to PHP Rates</h1>
      </div>
    </header>
  );
};

export default Header;
