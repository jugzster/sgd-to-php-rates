type InputProps = {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const Input = ({ value, onChange }: InputProps) => {
  return (
    <input
      className="px-3 py-1 rounded border border-blue-300 hover:bg-stone-100 w-32"
      type="text"
      maxLength={8}
      value={value}
      onChange={onChange}
    />
  );
};

export default Input;
