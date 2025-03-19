import { getTokenIcon } from "@/lib/getIcons";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface TokenSelectProps {
  tokens: Array<{ token: { symbol: string; name: string } }>;
  selectedIndex: number;
  onChange: (index: number) => void;
  className?: string;
}

export function TokenSelect({ tokens, selectedIndex, onChange, className }: TokenSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const TokenIcon = ({ symbol }: { symbol: string }) => {
    const iconSrc = getTokenIcon(symbol.toLowerCase());
    return iconSrc ? (
      <img src={iconSrc} alt={`${symbol} icon`} className="w-6 h-6 rounded-full" />
    ) : (
      <div className="w-6 h-6 rounded-full bg-gray-200" />
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className={`flex items-center gap-2 bg-white hover:bg-[#f8f8f8] px-3 py-1.5 rounded-full border ${className} z-500`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <TokenIcon symbol={tokens[selectedIndex]?.token.symbol} />
        <span>{tokens[selectedIndex]?.token.symbol}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[1000] mt-1 w-48 bg-white bg-opacity-100 rounded-lg shadow-lg border overflow-hidden">
          {tokens.map((token, index) => (
            <button
              key={token.token.symbol}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#f8f8f8] transition-colors bg-white"
              onClick={() => {
                onChange(index);
                setIsOpen(false);
              }}
            >
              <TokenIcon symbol={token.token.symbol} />
              <div className="flex flex-col items-start">
                <span className="font-medium">{token.token.symbol}</span>
                <span className="text-sm text-gray-500">{token.token.name}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
