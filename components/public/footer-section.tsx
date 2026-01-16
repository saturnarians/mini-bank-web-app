import { Logo } from "@/components/image"
export const Footer = () => {
  return (
    <footer className="bg-primary/90 border-t border-border/10 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-foreground">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary-foreground/60 text-lg md:text-xl font-bold">
            <Logo /> Patheon Bank
          </div>
          <p className="text-sm">Springfield London, UK</p>
          <p className="text-[#4ade80]">123-457-789</p>
        </div>
        
        <div>
          <h4 className="text-primary-foreground/60 font-medium mb-6">Depositors</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/40">
            <li>Nonprofits</li>
            <li>Real Estate</li>
            <li>Luxury Offices</li>
          </ul>
        </div>

        <div>
          <h4 className="text-primary-foreground/60 font-medium mb-6">Services</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/40">
            <li>Treasury Management</li>
            <li>Lending</li>
          </ul>
        </div>

        <div>
          <div className="glass p-4 rounded-lg inline-block">
             <span className="text-[10px] text-primary-foreground/40 block text-center">ACCREDITED BUSINESS</span>
             <span className="text-primary-foreground/40 font-bold block text-center">BBB</span>
          </div>
          <p className="text-[10px] mt-4 leading-relaxed text-primary-foreground/60">
            Patheon Inc. is not an FDIC insured bank. Deposit insurance covers the failure of an insured bank.
          </p>
        </div>
      </div>
    </footer>
  );
};