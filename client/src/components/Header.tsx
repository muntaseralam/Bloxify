import { Link } from 'wouter';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from './ui/button';
import { Shield } from 'lucide-react';

const Header = () => {
  const { isAdmin } = useAdmin();

  return (
    <header className="mb-8">
      <div className="flex flex-col items-center">
        <div className="bg-[#FF4500] inline-block px-4 py-2 rounded-lg transform -rotate-2 mb-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-wider">BLOXIFY</h1>
        </div>
        <div className="bg-white rounded-lg p-4 inline-block transform rotate-1 shadow-lg">
          <p className="text-xl md:text-2xl font-bold text-[#1A1A1A]">The Ultimate Roblox Product</p>
        </div>
      </div>
      
      {/* Navigation bar with admin link */}
      <nav className="mt-6 flex justify-center">
        <ul className="flex gap-4 items-center">
          <li>
            <Link href="/">
              <span className="hover:underline cursor-pointer">Home</span>
            </Link>
          </li>
          {isAdmin && (
            <li>
              <Link href="/admin">
                <Button size="sm" variant="outline" className="gap-1">
                  <Shield className="h-4 w-4" />
                  <span>Admin Panel</span>
                </Button>
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
