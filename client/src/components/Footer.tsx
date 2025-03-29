const Footer = () => {
  return (
    <footer className="text-center text-gray-600 mt-12">
      <div className="p-4 bg-white rounded-lg inline-block shadow-md">
        <p className="mb-2">© {new Date().getFullYear()} Bloxify - The Ultimate Roblox Product</p>
        <div className="flex justify-center space-x-4">
          <a href="#" className="text-[#1A1A1A] hover:text-[#00A2FF]">Terms</a>
          <a href="#" className="text-[#1A1A1A] hover:text-[#00A2FF]">Privacy</a>
          <a href="#" className="text-[#1A1A1A] hover:text-[#00A2FF]">Support</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
