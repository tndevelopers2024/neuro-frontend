import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home, Star, FileText } from 'lucide-react';

const Breadcrumb = ({ items = [] }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center justify-between flex-wrap gap-4">
      <ol className="flex items-center flex-wrap gap-1.5 text-sm font-medium text-muted bg-white/80 border border-borderLine px-4 py-2 rounded-xl shadow-xs">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isHome = index === 0;

          return (
            <li key={index} className="flex items-center gap-1.5">
              {!isHome && <ChevronRight className="w-3.5 h-3.5 text-muted/70 mx-0.5 shrink-0" />}
              {isLast ? (
                <span className="font-bold text-primaryBlue truncate max-w-xs md:max-w-md">
                  {item.title}
                </span>
              ) : (
                <Link
                  to={item.link}
                  className="hover:text-primaryBlue transition-colors flex items-center gap-1.5 font-semibold"
                >
                  {isHome && <Home className="w-4 h-4 text-primaryBlue mb-0.5" />}
                  <span>{item.title}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      {/* Quick Favorite / Study Action Badge (Matching screenshot header action bar) */}
      <div className="flex items-center gap-2.5">
        <button className="flex items-center gap-2 bg-white hover:bg-secondaryBg text-navy border border-borderLine px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all transform hover:-translate-y-0.5 active:translate-y-0">
          <Star className="w-3.5 h-3.5 text-medicalOrange fill-medicalOrange/20" />
          <span>Add to Favorites</span>
        </button>
        <Link
          to="/my-notes"
          className="flex items-center gap-2 bg-[#E9F2FF] hover:bg-primaryBlue text-primaryBlue hover:text-white border border-primaryBlue/20 px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all transform hover:-translate-y-0.5 active:translate-y-0 group"
        >
          <FileText className="w-3.5 h-3.5 group-hover:text-white transition-colors" />
          <span>Notes</span>
        </Link>
      </div>
    </nav>
  );
};

export default Breadcrumb;
