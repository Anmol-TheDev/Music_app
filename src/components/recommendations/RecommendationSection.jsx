import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import PropTypes from "prop-types";

export default function RecommendationSection({ title, children, emoji }) {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      const newScrollPosition =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          {emoji && <span className="text-3xl">{emoji}</span>}
          {title}
        </h2>
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-all duration-200 hover:scale-110"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-all duration-200 hover:scale-110"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
RecommendationSection.propTypes = {
  title: PropTypes.string.isRequired,
  emoji: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
