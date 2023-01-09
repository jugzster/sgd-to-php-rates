type InputProps = {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const Input = ({ value, onChange }: InputProps) => {
  return (
    <input
      className="w-36 px-3 py-1 rounded border border-blue-300 hover:bg-stone-100 dark:hover:bg-gray-700 dark:text-white dark:bg-gray-900"
      type="text"
      maxLength={8}
      value={value}
      onChange={onChange}
    />
  );
};

export default Input;
