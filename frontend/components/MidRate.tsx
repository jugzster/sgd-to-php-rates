type MidRateProps = {
  midRate: number;
};

const MidRate = ({ midRate }: MidRateProps) => {
  return (
    <div className="text-center font-semibold mt-8 mb-4 h-14">
      <p className="text-slate-400">MARKET RATE: 1 SGD =</p>
      <p className="text-xl hover:text-2xl font-bold duration-200">
        {midRate} Philippine Pesos
      </p>
    </div>
  );
};

export default MidRate;
