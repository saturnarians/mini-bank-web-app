import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export const Features = () => {
  return (
    <section className="bg-background py-24 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Rate Comparison Card */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="bg-linear-to-b from-white/5 to-transparent p-10 rounded-4xl border border-white/10"
        >
          <div className="space-y-8">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Patheon Bank Rates</span>
                <span className="text-[#4ade80]">4.5% APY</span>
              </div>
              <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: '90%' }}
                  className="h-full bg-linear-to-r from-[#4ade80] to-emerald-500" 
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">National Average</span>
                <span className="text-gray-500">0.5% APY</span>
              </div>
              <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gray-600 w-[10%]" />
              </div>
            </div>
          </div>
          <h3 className="text-2xl mt-12 font-medium text-wrap text-center">Better Integration</h3>
        </motion.div>

        <div className="flex flex-col justify-center text-wrap text-center">
          <h2 className="text-4xl font-bold mb-6 ">Your Money Deserves <br/> Better Rates</h2>
          <p className="text-gray-400 mb-8 ">
            Embedded here is the bank failure banking timeline. We ensure your designers match the web design perfectly.
          </p>
          <Button variant="outline" className="w-fit rounded-full border-white/20">View Rates ↗</Button>
        </div>
      </div>
    </section>
  );
};