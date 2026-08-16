import { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  ColorType,
  LineSeries,
} from "lightweight-charts";
import { fetchHistoricalRates, HistoricalRate } from "../lib/historicalRates";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const RANGES = ["1W", "1M", "3M", "6M", "1Y", "2Y", "All"] as const;

type RateChartProps = {
  midRate: number;
};

const RateChart = ({ midRate }: RateChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const dataRangeRef = useRef<string>("1Y");
  const [selectedRange, setSelectedRange] = useState<string>("1Y");
  const [data, setData] = useState<HistoricalRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (range: string) => {
    setLoading(true);
    setError(null);
    setData([]);
    try {
      const result = await fetchHistoricalRates(range);
      dataRangeRef.current = range;
      setData(result);
    } catch (e) {
      setError("Failed to load chart data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedRange);
  }, [selectedRange]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const getThemeColors = () => {
      const isDark = document.documentElement.classList.contains("dark");
      return {
        background: isDark ? "#111827" : "#ffffff",
        text: isDark ? "#9ca3af" : "#6b7280",
        grid: isDark ? "#1f2937" : "#f3f4f6",
        border: isDark ? "#374151" : "#e5e7eb",
      };
    };

    const colors = getThemeColors();

    const containerWidth = chartContainerRef.current.clientWidth;
    const isMobile = containerWidth < 640;

    const chart = createChart(chartContainerRef.current, {
      width: containerWidth,
      height: isMobile ? 250 : 350,
      layout: {
        background: { type: ColorType.Solid, color: colors.background },
        textColor: colors.text,
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      crosshair: {
        mode: 0,
        vertLine: {
          labelVisible: false,
        },
        horzLine: {
          labelVisible: false,
        },
      },
      rightPriceScale: {
        borderColor: colors.border,
      },
      timeScale: {
        borderColor: colors.border,
        timeVisible: selectedRange === "1W" || selectedRange === "1M",
      },
    });

    const series = chart.addSeries(LineSeries, {
      color: "#2563eb",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    // Custom tooltip for SGT time
    const tooltip = tooltipRef.current;
    if (tooltip) {
      chart.subscribeCrosshairMove((param) => {
        if (!param.time || !param.point) {
          tooltip.style.display = "none";
          return;
        }
        const price = param.seriesData.get(series) as
          | { value?: number }
          | undefined;
        if (!price?.value) {
          tooltip.style.display = "none";
          return;
        }

        // Format time in SGT
        const time = param.time;
        let sgtTime: string;
        if (typeof time === "number") {
          // Unix timestamp (short ranges)
          sgtTime = dayjs
            .unix(time)
            .tz("Asia/Singapore")
            .format("MMM D, YYYY, HH:mm");
        } else {
          // Date string (daily ranges)
          sgtTime = dayjs
            .tz(time as string, "Asia/Singapore")
            .format("MMM D, YYYY");
        }

        const isDark = document.documentElement.classList.contains("dark");
        tooltip.innerHTML = `
          <div style="font-size: 12px; line-height: 1.4;">
            <div style="color: ${isDark ? "#9ca3af" : "#6b7280"}; margin-bottom: 2px;">${sgtTime} SGT</div>
            <div style="font-weight: 600; color: ${isDark ? "#f3f4f6" : "#111827"};">${price.value.toFixed(4)} PHP</div>
          </div>
        `;
        tooltip.style.display = "block";
        tooltip.style.left = `${param.point.x + 12}px`;
        tooltip.style.top = `${param.point.y + 12}px`;
      });
    }
    // Watch for theme changes
    const observer = new MutationObserver(() => {
      const newColors = getThemeColors();
      chart.applyOptions({
        layout: {
          background: { type: ColorType.Solid, color: newColors.background },
          textColor: newColors.text,
        },
        grid: {
          vertLines: { color: newColors.grid },
          horzLines: { color: newColors.grid },
        },
        rightPriceScale: { borderColor: newColors.border },
        timeScale: { borderColor: newColors.border },
      });
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const handleResize = () => {
      if (chartContainerRef.current) {
        const w = chartContainerRef.current.clientWidth;
        chart.applyOptions({
          width: w,
          height: w < 640 ? 250 : 350,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!seriesRef.current || data.length === 0) return;
    if (dataRangeRef.current !== selectedRange) return;

    const isDaily = ["1Y", "2Y", "All"].includes(selectedRange);

    const chartData = data.map((d) => ({
      time: isDaily
        ? dayjs(d.date).tz("Asia/Singapore").format("YYYY-MM-DD")
        : Math.floor(dayjs(d.date).tz("Asia/Singapore").unix()),
      value: d.rate,
    }));

    seriesRef.current.setData(chartData as any);
    chartRef.current?.timeScale().fitContent();
  }, [data, selectedRange]);

  const percentageChange =
    data.length >= 2
      ? ((data[data.length - 1].rate - data[0].rate) / data[0].rate) * 100
      : 0;

  const isPositive = percentageChange >= 0;

  const latestDate = data.length > 0 ? data[data.length - 1].date : null;
  const formattedDate = latestDate
    ? dayjs(latestDate).tz("Asia/Singapore").format("MMM D, YYYY, HH:mm")
    : "";

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 px-2 gap-2">
        <div>
          <h2 className="text-lg font-semibold">
            SGD to PHP Chart{" "}
            <span
              className={
                isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }
            >
              {isPositive ? "+" : ""}
              {percentageChange.toFixed(2)}%
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
              ({selectedRange})
            </span>
          </h2>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
          1 SGD = {midRate.toFixed(4)} PHP{" "}
          <span className="text-gray-400 dark:text-gray-500">
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Range selector */}
      <div className="flex flex-wrap justify-center gap-1 mb-4">
        {RANGES.map((range) => (
          <button
            key={range}
            onClick={() => setSelectedRange(range)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedRange === range
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div
        ref={chartContainerRef}
        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden relative"
      >
        {loading && (
          <div className="flex items-center justify-center h-[250px] sm:h-[350px]">
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-[250px] sm:h-[350px]">
            <p className="text-red-500 dark:text-red-400">{error}</p>
          </div>
        )}
        {/* Custom tooltip */}
        <div
          ref={tooltipRef}
          className="absolute pointer-events-none hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 shadow-lg z-10"
        />
      </div>
    </div>
  );
};

export default RateChart;
