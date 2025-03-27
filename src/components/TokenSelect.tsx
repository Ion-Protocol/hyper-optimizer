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
    if (!symbol) return <div className="w-6 h-6 rounded-full bg-gray-200" />;
    const iconSrc = getTokenIcon(symbol.toLowerCase());
    if (!iconSrc) return <div className="w-6 h-6 rounded-full bg-gray-200" />;
    return <img src={iconSrc} alt={`${symbol} icon`} className="w-6 h-6 rounded-full" />;
  };

  // Ensure we have valid tokens and a valid selected index
  const validTokens = tokens.filter((token) => token?.token?.symbol && token?.token?.name);
  const validSelectedIndex = Math.min(selectedIndex, validTokens.length - 1);
  const selectedToken = validTokens[validSelectedIndex]?.token;
  const selectedSymbol = selectedToken?.symbol || "";

  // If we have no valid tokens, show a placeholder
  if (validTokens.length === 0) {
    return (
      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border">
        <div className="w-6 h-6 rounded-full bg-gray-200" />
        <span className="text-gray-500">No tokens available</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className={`flex items-center gap-2 bg-white hover:bg-[#f8f8f8] px-3 py-1.5 rounded-full border ${className} z-500`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <TokenIcon symbol={selectedSymbol} />
        <span>{selectedSymbol}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && validTokens.length > 0 && (
        <div className="absolute z-[1000] mt-1 w-48 bg-white bg-opacity-100 rounded-lg shadow-lg border overflow-hidden">
          {validTokens.map((token, index) => (
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
