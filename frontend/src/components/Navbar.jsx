import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown } from 'lucide-react';
import { useCart }      from '../context/CartContext';
import { useWishlist }  from '../context/WishlistContext';
import { useAuth }  from '../context/AuthContext';
import { NAV_SECTIONS } from '../lib/categories';

const navLinks = NAV_SECTIONS.map(section => ({
  label: section.label,
  href: `/products?section=${section.key}`,
  sub: section.categories.filter(c => c !== 'All'),
  sectionKey: section.key,
}));

export default function Navbar() {
  const { cartCount }       = useCart();
  const { wishlistCount }   = useWishlist();
  const { user, logout }   = useAuth();
  const navigate           = useNavigate();
  const location           = useLocation();
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ]       = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const searchRef = useRef(null);
  const dropTimer = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setSearchOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate('/products?q=' + encodeURIComponent(searchQ.trim()));
      setSearchOpen(false);
      setSearchQ('');
    }
  };

  const openDrop  = (label) => { clearTimeout(dropTimer.current); setActiveDropdown(label); };
  const closeDrop = ()      => { dropTimer.current = setTimeout(() => setActiveDropdown(null), 150); };

  const isTransparent = !scrolled && location.pathname === '/';

  return (
    <>
      <header className={'sticky top-0 z-50 transition-all duration-300 ' + (
        isTransparent
          ? 'bg-transparent border-b border-transparent'
          : scrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-soft'
            : 'bg-white border-b border-stone-200'
      )}>
        <div className="flex items-center justify-between h-16 gap-4 px-4 mx-auto max-w-7xl sm:px-6">

          <Link to="/" className="shrink-0">
            <span className="text-3xl leading-none font-script text-charcoal-800">Nura Bahar</span>
          </Link>

          <nav className="items-center hidden gap-1 lg:flex">
            {navLinks.map(link => (
              <div key={link.label}
                className="relative"
                onMouseEnter={() => link.sub.length > 0 && openDrop(link.label)}
                onMouseLeave={() => link.sub.length > 0 && closeDrop()}
              >
                <Link
                  to={link.href}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors duration-150 font-body text-charcoal-800 hover:text-blush-500"
                >
                  {link.label}
                  {link.sub.length > 0 && <ChevronDown size={13} className="opacity-60 mt-0.5" />}
                </Link>

                {link.sub.length > 0 && activeDropdown === link.label && (
                  <div className="absolute left-0 z-50 pt-1 top-full"
                    onMouseEnter={() => openDrop(link.label)}
                    onMouseLeave={() => closeDrop()}
                  >
                    <div className="bg-white border border-stone-200 shadow-card min-w-[180px] py-2">
                      {link.sub.map(cat => (
                        <Link
                          key={cat}
                          to={'/products?section=' + link.sectionKey + '&category=' + encodeURIComponent(cat)}
                          className="block px-5 py-2.5 font-body text-sm text-charcoal-700 hover:bg-stone-50 hover:text-charcoal-900 transition-colors"
                        >
                          {cat}
                        </Link>
                      ))}
                      <div className="pt-1 mt-1 border-t border-stone-100">
                        <Link
                          to={link.href}
                          className="block px-5 py-2.5 font-body text-xs text-blush-500 hover:bg-stone-50 tracking-wider uppercase"
                        >
                          View All {link.label}
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <Link to="/faq"
              className="px-4 py-2 text-sm font-medium transition-colors font-body text-charcoal-800 hover:text-blush-500">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(s => !s)}
              className="flex items-center justify-center transition-colors w-9 h-9 text-charcoal-800 hover:text-blush-500"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            {user ? (
              <div className="relative group">
                <button className="flex items-center justify-center transition-colors w-9 h-9 text-charcoal-800 hover:text-blush-500">
                  <User size={18} />
                </button>
                <div className="absolute right-0 z-50 hidden pt-1 top-full group-hover:block">
                  <div className="bg-white border border-stone-200 shadow-card min-w-[160px] py-2">
                    <p className="px-4 py-2 mb-1 text-xs border-b font-body text-charcoal-700/60 border-stone-100">{user.email}</p>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm transition-colors font-body text-charcoal-700 hover:bg-stone-50 hover:text-charcoal-900"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={logout}
                      className="block w-full px-4 py-2 text-sm text-left transition-colors font-body text-charcoal-700 hover:bg-stone-50 hover:text-blush-500"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="flex items-center justify-center transition-colors w-9 h-9 text-charcoal-800 hover:text-blush-500" aria-label="Login">
                <User size={18} />
              </Link>
            )}

            <Link to="/wishlist" className="relative items-center justify-center hidden transition-colors sm:flex w-9 h-9 text-charcoal-800 hover:text-blush-500" aria-label="Wishlist">
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-blush-500 text-white font-body text-[9px] rounded-full">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative flex items-center justify-center transition-colors w-9 h-9 text-charcoal-800 hover:text-blush-500" aria-label="Cart">
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] bg-blush-500 text-white text-[10px] font-body font-semibold flex items-center justify-center rounded-full px-0.5">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileOpen(o => !o)}
              className="flex items-center justify-center lg:hidden w-9 h-9 text-charcoal-800"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="bg-white border-t border-stone-200 animate-fade-in">
            <form onSubmit={handleSearch} className="flex max-w-2xl gap-3 px-6 py-4 mx-auto">
              <input
                ref={searchRef}
                type="text"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search products…"
                className="flex-1 border-b border-charcoal-800 bg-transparent font-body text-sm text-charcoal-800 pb-1.5 focus:outline-none placeholder-stone-400"
              />
              <button type="submit" className="font-body text-xs tracking-widest uppercase text-charcoal-800 hover:text-blush-500 transition-colors pb-1.5">
                Search
              </button>
              <button type="button" onClick={() => setSearchOpen(false)} className="text-charcoal-700/40 hover:text-charcoal-800 pb-1.5">
                <X size={16} />
              </button>
            </form>
          </div>
        )}
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="absolute inset-0 bg-charcoal-900/40" onClick={() => setMobileOpen(false)} />
          <div className="relative flex flex-col h-full ml-auto bg-white w-72 shadow-lift animate-slide-in">
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200">
              <span className="text-2xl font-script text-charcoal-800">Nura Bahar</span>
              <button onClick={() => setMobileOpen(false)}><X size={20} className="text-charcoal-700" /></button>
            </div>
            <nav className="flex-1 py-4 overflow-y-auto">
              {navLinks.map(link => (
                <div key={link.label}>
                  <Link
                    to={link.href}
                    className="flex items-center justify-between px-6 py-3.5 font-body text-sm font-medium border-b border-stone-100 text-charcoal-800"
                  >
                    {link.label}
                  </Link>
                  {link.sub.map(cat => (
                    <Link
                      key={cat}
                      to={'/products?section=' + link.sectionKey + '&category=' + encodeURIComponent(cat)}
                      className="block pl-10 pr-6 py-2.5 font-body text-sm text-charcoal-700/70 hover:text-charcoal-900 border-b border-stone-50"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              ))}
              <Link to="/faq" className="block px-6 py-3.5 font-body text-sm font-medium text-charcoal-800 border-b border-stone-100">FAQ</Link>
            </nav>
            <div className="flex flex-col gap-3 px-6 py-5 border-t border-stone-200">
              {user ? (
                <>
                  <p className="text-xs font-body text-charcoal-700/60">{user.email}</p>
                  <Link to="/orders" className="w-full text-center btn-outline">My Orders</Link>
                  <button onClick={logout} className="w-full btn-outline">Sign out</button>
                </>
              ) : (
                <Link to="/login" className="w-full text-center btn-primary">Login / Register</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}